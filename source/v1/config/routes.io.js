import notification from '../controller/Notification';
import authIO from '../middleware/auth.io';

export default (io) => {
    io
        .of('/notification')
        .use(authIO)
        .on('connection', (socket) => {
            socket.on('register', notification.register);
            socket.on('disconnect', () => {
                socket.on('unregister', notification.unRegister);
            });
        });
};