import sio from '../config/socketio';
import Notification from '../models/Notification';
import log from '../config/log';

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
        log.info({userId, notification}, 'Notification');
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
            meta: {_id: user._id, firstname: user.firstname, lastname: user.lastname, username: user.username}
        });

        await this.send(friend._id, note, Events.Friend_Accepted);
    }

    /**
     *
     * @param {wu.model.User} user
     * @param {wu.model.User} friend
     */
    async notifyFriendInvited(user, friend) {
        const note = await Notification.create({
            message: 'Friend invited',
            title: 'Friend invited',
            owner: user._id,
            meta: {_id: user._id, firstname: user.firstname, lastname: user.lastname, username: user.username}
        });

        await this.send(friend._id, note, Events.Friend_Accepted);
    }

    /**
     *
     * @param {string} owner
     * @param {number} limit
     * @param {number} page
     * @param {string} sort
     * @returns Array<wu.model.Notification>
     */
    async getNotifications(owner, limit = 100, page = 1, sort = '-read') {
        return this.getAllNotifications({owner}, limit, page, sort);
    }

    /**
     *
     * @param {object} where
     * @param {number} limit
     * @param {number} page
     * @param {string} sort
     * @returns Array<wu.model.Notification>
     */
    async getAllNotifications(where, limit = 100, page = 1, sort = '-read') {
        return await Notification.find(where).sort(sort).limit(limit).skip((page - 1) * limit).exec();
    }

    /**
     *
     * @param {object} where
     * @param {number} limit
     * @param {number} page
     * @param {string} sort
     * @returns Promise<number>
     */
    async countNotifications(where) {
        return await Notification.count(where).exec();
    }
}


export default new NotificationService();
