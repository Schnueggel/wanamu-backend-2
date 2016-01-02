import sio from '../config/socketio';
import Notification from '../models/Notification';
import * as socketEmitter from 'socket.io-emitter';

export const Events = {
    Shared_Todo_Finished: 'Shared_Todo_Updated',
    Shared_Todo_Accepted: 'Shared_Todo_Accepted',
    Friend_Accepted: 'Friend_Accepted'
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
    async notifyTodoFinished(parentTodo, sharedTodo) {
        const note = await Notification.create({
            message: 'Shared todo was finished',
            title: 'Shared todo was finished',
            owner: parentTodo.owner,
            meta: {parent: parentTodo._id, shared: sharedTodo._id}
        });

        await this.send(parentTodo.owner, note, Events.Shared_Todo_Finished);
    }

    /**
     * Sends a notification to the shared todo owner that the todo is accepted
     * @param {wu.model.Todo} parentTodo
     * @param {wu.model.Todo} acceptedTodo
     */
    async notifyTodoAccepted(parentTodo, acceptedTodo) {
        const note = await Notification.create({
            message: 'Shared todo was accepted',
            title: 'Shared todo was accepted',
            owner: parentTodo.owner,
            meta: {parent: parentTodo._id, shared: acceptedTodo._id}
        });

        await this.send(parentTodo.owner, note, Events.Shared_Todo_Accepted);
    }

    /**
     *
     * @param {wu.model.User} user
     * @param {wu.model.User} friend
     */
    async notifyFriendAccepted(user, friend) {
        const note = await Notification.create({
            message: 'Friend accepted',
            title: 'Friend accepted',
            owner: user._id,
            meta: {_id: friend._id, firstname: friend.firstname, lastname: friend.lastname, username: friend.username}
        });

        await this.send(user._id, note, Events.Friend_Accepted);
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
     * @returns Promise<number>
     */
    async countNotifications(userId) {
        return await Notification.count({
            owner: userId
        }).exec();
    }
}


export default new NotificationService();
