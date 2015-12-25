import User from '../models/User';
import errors from '../errors';
import mongoose from 'mongoose';
import * as _ from 'lodash';
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

        if (!ctx.params.id) {
            ctx.params.id = ctx.user._id;
        }

        if (!mongoose.Types.ObjectId.isValid(fid)) {
            ctx.status = 400;
            result.error = new errors.RequestDataError('Invalid parameter friend id');
            ctx.body = result;
            return;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to add friends to this user');
            ctx.body = result;
            return;
        }

        if (ctx.user._id.equals(fid)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('You are not allowed to make friends with yourself');
            ctx.body = result;
            return;
        }

        let userDoc;

        if (ctx.user._id.equals(ctx.params.id)) {
            userDoc = ctx.user;
        } else {
            userDoc = await User.findById(ctx.params.id, {password: 0}).exec();
        }

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        const friendDoc = await User.findOne({
            _id: fid,
            ignoreList: {
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
    async acceptInvitation(ctx) {
        const result = {},
            fid = ctx.request.body.fid;

        if (!ctx.params.id) {
            ctx.params.id = ctx.user._id;
        }

        if (!mongoose.Types.ObjectId.isValid(fid)) {
            ctx.status = 400;
            result.error = new errors.RequestDataError('Invalid parameter friend id');
            ctx.body = result;
            return;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to accept friends invitation for this user');
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
    async declineInvitation(ctx) {
        const result = {},
            fid = ctx.request.body.fid;

        if (!ctx.params.id) {
            ctx.params.id = ctx.user._id;
        }

        if (!mongoose.Types.ObjectId.isValid(fid)) {
            ctx.status = 400;
            result.error = new errors.RequestDataError('Invalid parameter friend id');
            ctx.body = result;
            return;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to decline friends invitation for this user');
            ctx.body = result;
            return;
        }

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

        if (!ctx.params.id) {
            ctx.params.id = ctx.user._id;
        }

        if (!mongoose.Types.ObjectId.isValid(fid)) {
            ctx.status = 400;
            result.error = new errors.RequestDataError('Invalid parameter friend id');
            ctx.body = result;
            return;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to delete a friend of this user');
            ctx.body = result;
            return;
        }

        const friendDoc = await User.findByIdAndUpdate(fid, {
            $pull: {
                friends: ctx.params.id
            }
        }, {new: true}).exec();

        const userDoc = await User.findByIdAndUpdate(ctx.params.id, {
            $pull: {
                friends: fid
            }
        }, {new: true}).exec();

        if (!userDoc || !friendDoc) {
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

        if (!ctx.params.id) {
            ctx.params.id = ctx.user._id;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to get friends of this user');
            ctx.body = result;
            return;
        }

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

        result.data = [await userService.getFriendList(user)];

        ctx.body = result;
    }
}

export default new FriendController();
