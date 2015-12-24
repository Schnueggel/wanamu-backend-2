import User from '../models/User';
import errors from '../errors';
import mongoose from 'mongoose';
import * as _ from 'lodash';

export class UserController {

    /**
     * params {
     *    id: <userId>
     * }
     * @param {object} ctx
     */
    async addFriends(ctx) {
        const result = {};
        let friendIds = ctx.request.body.friends || [];

        friendIds = friendIds.filter( v => mongoose.Types.ObjectId.isValid(v));

        if (_.isEmpty(friendIds)) {
            ctx.status = 422;
            result.error = new errors.RequestDataError('Invalid request data. Expecting Array containing valid friends ids');
            ctx.body = result;
            return;
        }

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to add friendst to this user');
            ctx.body = result;
            return;
        }

        try {
            const updateResult = await User.update({_id: ctx.params.id}, {
                $addToSet: {
                    friends: friendIds
                }
            });

            if (updateResult.ok !== 1) {
                ctx.status = 404;
                result.error = new errors.NotFoundError('Could not find user');
            } else {
                const userDoc = await User.findById(ctx.params.id).exec();
                result.data = userDoc.friends;
            }
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                result.error = errors.ValidationError.fromMongooseValidationError(err);
                ctx.status = 422;
            } else {
                result.error = new Error(err.message);
                ctx.status = 500;
            }
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

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to add friends to this user');
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

        const friends = await User.find({
            _id: {
                $in: user.friends
            }
        }, '_id firstname lastname username avatar').exec();

        result.data = friends;

        ctx.body = result;
    }

    /**
     * params: {
     *   id: <userId>
     * }
     * @param ctx
     */
    async deleteUser(ctx) {
        const result = {};

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to delete this user');
            ctx.body = result;
            return;
        }

        const userDoc = await User.findById(ctx.params.id, {password: 0}).exec();

        if (userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        try {
            const removed = await userDoc.remove();
            if (!removed) {
                ctx.status = 404;
            }
        } catch (err) {
            result.error = new Error(err.message);
            ctx.status = 500;
        }

        ctx.body = result;
    }

    /**
     * params: {
     *   id: <userId>
     * }
     * @param ctx
     */
    async getUser(ctx) {
        const result = {};

        if (!ctx.user._id.equals(ctx.params.id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to get this user');
            ctx.body = result;
            return;
        }

        const userDoc = await User.findById(ctx.params.id, {password: 0}).exec();

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        result.data = [userDoc];

        ctx.body = result;
    }
}

export default new UserController();