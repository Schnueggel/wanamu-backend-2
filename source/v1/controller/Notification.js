import mongoose from 'mongoose';
import userService from '../services/user';
import notificationService from '../services/notification';
import errors from '../errors';
import * as _ from 'lodash';

export class NotificationController {

    async getNotifications(ctx) {
        const notes = await notificationService.getNotifications(ctx.user._id, ctx.request.query.limit, ctx.request.query.page),
            total = await notificationService.countNotifications(ctx.user._id);

        ctx.body = {
            page: ctx.request.query.page,
            limit: ctx.request.query.limit,
            total,
            data: notes
        };
    }
}

export default new NotificationController();