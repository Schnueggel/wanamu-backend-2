import io from '../config/socketio';

export class NotificationService {

    constructor() {
        this.userSockets = {};
    }

    register(userId, socketId) {
        this.userSockets[userId] = socketId;
    }

    unRegister(socketId) {
        Object.keys(this.userSockets).forEach((key) => {
            if (this.userSockets[key] === socketId) {
                delete this.userSockets[key];
                return false;
            }
        });
    }

    send(userId, route, notification) {
        const socket = io.sockets.connected[this.userSockets[userId]];
        if (socket) {
            socket.emit(route, notification);
        }
    }
}


export default new NotificationService();
