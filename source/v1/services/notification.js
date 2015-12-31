import io from '../config/socketio';
import redis from '../config/redis';
import Notification from '../models/Notification';

export class NotificationService {

    static get socketUserHash() {
        return 'WuSocketUserMap';
    }

    static get userSocketList() {
        return 'WuUserSocketList';
    }

    constructor() {
        this.redisClient = redis.redis.createClient();
    }

    /**
     *
     * @param userId
     * @param socketId
     * @returns {Promise}
     */
    register(userId, socketId) {
        const multi = this.redisClient.multi();

        multi.hset(NotificationService.socketUserHash, socketId, userId);
        multi.lrem(this.getUserListName(userId), 0, socketId);
        multi.lpush(this.getUserListName(userId), socketId);

        return multi.execAsync();
    }

    unRegister(socketId) {
        return this.redisClient.hgetAsync(NotificationService.socketUserHash, socketId)
            .then((userId) => {
                if (userId) {
                    this.redisClient.lrem(this.getUserListName(userId), 0, socketId);
                    this.redisClient.hdel(NotificationService.socketUserHash, socketId);
                }
            });
    }

    getConnections(userId) {
        return this.redisClient.lrangeAsync(this.getUserListName(userId), 0, -1);
    }

    /**
     *
     * @param {string} userId
     * @param {wu.model.Notification} notification
     * @param {string} event
     */
    async send(userId, notification, event = 'notification') {
        io.to('room-' + userId).emit(event, notification);
    }

    getUserListName(userId) {
        return NotificationService.userSocketList + userId;
    }

    /**
     *
     * @param {wu.model.Todo} parentTodo
     * @param {wu.model.Todo} sharedTodo
     * @returns wu.model.Notification
     */
    createSharedTodoUpdatedNotification(parentTodo, sharedTodo) {
        return new Notification({message: 'Shared todo was updated', title: 'Shared todo was updated', meta: {parent: parentTodo.parent, shared: sharedTodo._id}});
    }

    /**
     *
     * @returns RedisClient
     */
    get redisClient() {
        return this._redisClient;
    }

    /**
     *
     * @param {RedisClient} value
     */
    set redisClient(value) {
        this._redisClient = value;
    }
}


export default new NotificationService();
