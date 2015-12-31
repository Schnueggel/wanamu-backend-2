import sio from '../config/socketio';
import Notification from '../models/Notification';
import * as socketEmitter from 'socket.io-emitter';
export const Events = {
    Shared_Todo_Updated: 'Shared_Todo_Updated'
};

export class NotificationService {

    /**
     *
     * @param {string|Mongoose.Types.ObjectId} userId
     * @param {wu.model.Notification} notification
     * @param {string} event
     */
    async send(userId, notification, event = 'notification') {
        sio.emitter.of('/notification').in('room-' + userId).emit(event, notification);
    }

    /**
     *
     * @param {wu.model.Todo} parentTodo
     * @param {wu.model.Todo} sharedTodo
     */
    async notifyTodoUpdate(parentTodo, sharedTodo) {
        const note = await Notification.create({
            message: 'Shared todo was updated',
            title: 'Shared todo was updated',
            owner: parentTodo.owner,
            meta: {parent: parentTodo.parent, shared: sharedTodo._id}
        });

        await this.send(parentTodo.owner, note, Events.Shared_Todo_Updated);
    }

    /**
     *
     * @param {string} userId
     * @param {number} limit
     * @param {number} page
     * @param {string} sort
     * @returns Array<wu.model.Notification>
     */
    async getNotifications(userId, limit = 100, page=1, sort = '-read') {

        return await Notification.find({
            owner: userId
        }).sort(sort).limit(limit).skip((page-1)*limit).exec();
    }

    /**
     *
     * @param {string} userId
     * @param {number} limit
     * @param {number} page
     * @param {string} sort
     * @returns Number
     */
    async countNotifications(userId) {
        return await Notification.count({
            owner: userId
        }).exec();
    }
}


export default new NotificationService();
