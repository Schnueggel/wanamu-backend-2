import io from '../config/socketio';
import redis from '../config/redis';

export class NotificationService {

    static get socketUserHash() {
        return 'WuSocketUserMap';
    }

    static get userSocketList() {
        return 'WuUserSocketList';
    }

    constructor() {
        this.client = redis.redis.createClient();
    }

    /**
     *
     * @param userId
     * @param socketId
     * @returns {Promise}
     */
    register(userId, socketId) {
        const multi = this.client.multi();

        multi.hset(NotificationService.socketUserHash, socketId, userId);
        multi.lrem(this.getUserListName(userId), 0, socketId);
        multi.lpush(this.getUserListName(userId), socketId);

        return multi.execAsync();
    }

    unRegister(socketId) {
        return this.client.hgetAsync(NotificationService.socketUserHash, socketId)
            .then((userId) => {
                if (userId) {
                    this.client.lrem(this.getUserListName(userId), 0, socketId);
                    this.client.hdel(NotificationService.socketUserHash, socketId);
                }
            });
    }

    getConnections(userId) {
        return this.client.lrangeAsync(this.getUserListName(userId), 0, -1);
    }

    send(userId, route, notification) {
        this.client.lrangeAsync(this.getUserListName(userId), 0, -1)
            .then((socketIds) => {
                socketIds.forEach((socketId) => {
                    const socket = io.sockets.connected[socketId];
                    if (socket) {
                        socket.emit(route, notification);
                    } else {
                        this.unRegister(socketId);
                    }
                });
            }).catch(console.error);
    }

    getUserListName(userId) {
        return NotificationService.userSocketList + userId;
    }
}


export default new NotificationService();
