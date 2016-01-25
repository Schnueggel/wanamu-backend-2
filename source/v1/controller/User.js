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

        const userDoc = await User.findByIdAndRemove(ctx.params.id, {select: {password: 0}}).exec();

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        result.data = [userDoc];

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

    /**
     * request.params: {
     *    id: <userId>
     * }
     * request.body: {
     *    id: <userId>
     * }
     * @param ctx
     */
    async ignoreUser(ctx) {
        const result = {};

        const userDoc = await User.findByIdAndUpdate(ctx.params.id, {
            $addToSet: {
                ignorelist: ctx.request.body.id
            },
            $pull: {
                friends: ctx.request.body.id
            }
        }, {new: true}).exec();

        const updatedFriend = await User.update({
            _id: ctx.request.body.id
        },{
            $pull: {
                friends: ctx.params.id
            }
        });

        if (!userDoc || userDoc.ignorelist.indexOf(ctx.request.body.id) === -1) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
        } else {
            //TODO notification
        }

        ctx.body = result;
    }

    /**
     *
     * @param ctx
     */
    async userNameCheck(ctx) {
        let data = false;
        if (typeof ctx.params.username === 'string') {
            const user = await User.findOne({
                username: ctx.params.username
            }).exec();

            if (user) {
                data = true;
            }
        }

        ctx.body = {
            data
        };
    }
}

export default new UserController();