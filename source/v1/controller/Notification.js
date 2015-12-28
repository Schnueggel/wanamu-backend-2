import mongoose from 'mongoose';
import userService from '../services/user';
import notificationService from '../services/notification';
import errors from '../errors';
import * as _ from 'lodash';

export class NotificationController {

    /**
     * Socket route
     * @param {Socket} socket
     */
    register(socket) {
        notificationService.register(socket.request.user._id, socket.id).then(()=> {
            socket.emit('register', true);
        }).catch((err) => {
            console.error(err);
            socket.emit('register', new errors.SocketIOError('Storing connection failed', 500));
        });
    }

    /**
     * Socket route
     * @param {Socket} socket
     */
    unRegister(socket) {
        notificationService.unRegister(socket.id);
    }

    /**
     *
     */
    getConnections(socket) {
        notificationService.getConnections(socket.request.user._id)
        .then((socketIds) => {
            socket.emit('getConnections', {socketIds});
        }).catch((err) => {
            socket.emit('getConnections', new errors.SocketIOError('Get connections failed', 500));
        });
    }
}

export default new NotificationController();