import Notification from '../models/Notification';
import notificationService from '../services/notification';
import * as _ from 'lodash';

export class NotificationController {

    async getNotifications(ctx) {
        const where = {
            owner: ctx.user._id
        };

        if (_.isString(ctx.request.query.read)) {
            where.read = Boolean(Number(ctx.request.query.read));
        }

        const notes = await notificationService.getAllNotifications(where, ctx.request.query.limit, ctx.request.query.page),
            total = await notificationService.countNotifications(where);

        ctx.body = {
            page: ctx.request.query.page,
            limit: ctx.request.query.limit,
            total,
            data: notes
        };
    }

    async markAsRead(ctx) {
        const ids = _.get(ctx.request.body, 'ids', []);

        let updated = 0;

        if (_.isEmpty(ids) === false) {
            const response = await Notification.update({
                owner: ctx.params.id,
                _id: {
                    $in: ids
                }
            },{
                read: true
            }, {
                multi: true
            }).exec();

            updated = response.n;
        }

        ctx.body = {
            updated,
            data: ids
        };
    }
}

export default new NotificationController();
