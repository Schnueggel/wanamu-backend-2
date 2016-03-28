import User from '../models/User';
import errors from '../errors';
import notificationService from '../services/notification';
import userService from '../services/user';

export class FriendController {

    /**
     * request.params: {
     *    id: <userId>
     * }
     * request.body: {
     *    fid: <userId>
     * }
     * @param {object} ctx
     */
    async inviteFriend(ctx) {
        const result = {},
            fid = ctx.request.body.fid;

        if (ctx.user._id.equals(fid)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('You are not allowed to make friends with yourself');
            ctx.body = result;
            return;
        }

        let userDoc;

        if (ctx.user._id.equals(ctx.params.id)) {
            userDoc = ctx.user;
        } else if (ctx.user.isAdmin) {
            userDoc = await User.findById(ctx.params.id).exec();
        } else {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('You are not allowed to make friends for other users');
            ctx.body = result;
            return;
        }

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        const friendDoc = await User.findOne({
            _id: fid,
            ignorelist: {
                $ne: ctx.params.id
            }
        }).exec();

        if (!friendDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Friend not found');
            ctx.body = result;
            return;
        }

        if (userDoc.friends.indexOf(fid) > -1 && friendDoc.friends.indexOf(ctx.params.id) === -1) {
            //TODO resend invitation
            ctx.status = 204;
            result.message = 'Resend friendship invitation';
            ctx.body = result;
            return;
        }

        const updated = await User.update(
            {_id: ctx.params.id},
            {
                $addToSet: {
                    friends: fid
                }
            });

        if (!updated.ok) {
            ctx.status = 404;
            console.error(`Unable to add friend ${fid} to user ${ctx.params.id}`);
        } else {
            result.data = {
                _id: friendDoc._id,
                username: friendDoc.username
            };
        }

        ctx.body = result;
    }

    /**
     * request.params = {
     *      username: string
     * }
     * @param {object} ctx
     */
    async inviteFriendByEmailOrUsername(ctx) {
        if (!ctx.request.body.username) {
            ctx.status = 400;
            ctx.body = {
                message: 'Invalid email or username'
            };
            return;
        }

        const user = await userService.findUserByEmailOrUsername(ctx.request.body.username);

        if (!user) {
            ctx.status = 404;
            ctx.body = {
                message: 'User not found'
            };
            return;
        }

        ctx.request.body.fid = user._id;

        return friendController.inviteFriend(ctx);
    }

    /**
     * request.params: {
     *    id: <userId>
     * }
     * request.body: {
     *    fid: <userId>
     * }
     * @param ctx
     */
    async acceptInvitation(ctx) {
        const result = {},
            fid = ctx.request.body.fid;

        const friendDoc = await User.findById(fid).exec();

        if (!friendDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Friend not found');
            ctx.body = result;
            return;
        }

        if (friendDoc.friends.indexOf(ctx.params.id) === -1) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('You have no invitation to accept from this user');
            ctx.body = result;
            return;
        }

        const userDoc = await User.findByIdAndUpdate(ctx.params.id, {
            $addToSet: {
                friends: fid
            }
        }, {new: true}).exec();

        if (!userDoc || userDoc.friends.indexOf(fid) === -1) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
        } else {
            notificationService.notifyFriendAccepted(userDoc, friendDoc);
        }

        ctx.body = result;
    }

    /**
     * request.params: {
     *    id: <userId>
     * }
     * request.body: {
     *    fid: <userId>
     * }
     * @param ctx
     */
    async declineInvitation(ctx) {
        const result = {},
            fid = ctx.request.body.fid;

        const userDoc = await User.findByIdAndUpdate(fid, {
            $pull: {
                friends: ctx.params.id
            }
        }, {new: true}).exec();

        if (!userDoc || userDoc.friends.indexOf(fid) > -1) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
        } else {
            //TODO send notification
        }

        ctx.body = result;
    }

    /**
     * request.params: {
     *    id: <userId>
     * }
     * request.body: {
     *    fid: <userId>
     * }
     * @param ctx
     */
    async deleteFriend(ctx) {
        const result = {},
            fid = ctx.params.fid;

        await User.findByIdAndUpdate(fid, {
            $pull: {
                friends: ctx.params.id
            }
        }, {new: true}).exec();

        const userDoc = await User.findByIdAndUpdate(ctx.params.id, {
            $pull: {
                friends: fid
            }
        }, {new: true}).exec();

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
        } else {
            //TODO send notification
        }

        ctx.body = result;
    }


    /**
     * params: {
     *   id: <userId>
     * }
     * @param ctx
     */
    async getFriends(ctx) {
        const result = {};

        let user;
        if (ctx.user._id.equals(ctx.params.id)) {
            user = ctx.user;
        } else {
            user = await User.findById(ctx.params.id).exec();
        }

        if (!user) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Unable to find user');
            ctx.body = result;
            return;
        }

        result.data = await userService.getFriendList(user);

        ctx.body = result;
    }
}

const friendController = new FriendController();

export default friendController;
