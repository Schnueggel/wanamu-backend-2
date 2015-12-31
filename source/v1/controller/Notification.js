import mongoose from 'mongoose';
import userService from '../services/user';
import notificationService from '../services/notification';
import errors from '../errors';
import * as _ from 'lodash';

export class NotificationController {

    async getNotifications(ctx) {
        const limit = ctx.request.query.limit ? Number(ctx.request.query.limit) : 100;
        const page = ctx.request.query.page ? Number(ctx.request.query.page) : 1;

        const notes = await notificationService.getNotifications(ctx.user._id, limit, page),
            total = await notificationService.countNotifications(ctx.user._id);

        console.log('total', total, page, limit);
        ctx.body = {
            page,
            limit,
            total,
            data: notes
        };
    }
}

export default new NotificationController();