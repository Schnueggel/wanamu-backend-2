import User from '../models/User';
import errors from '../errors';
import mongoose from 'mongoose';
import * as _ from 'lodash';

export class UserController {
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

        if (!userDoc) {
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