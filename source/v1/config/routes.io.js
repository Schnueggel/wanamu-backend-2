import notification from '../controller/Notification';
import authIO from '../middleware/auth.io';

export default (io) => {
    io
        .of('/notification')
        .use(authIO)
        .on('connection', (socket) => {
            notification.register(socket);
            socket.on('disconnect', () => notification.unRegister(socket));
            socket.on('getConnections', () => notification.getConnections(socket));
        });
};