import authIO from '../middleware/auth.io';
import log from '../config/log';

export default (io) => {
    io
        .of('/notification')
        .use(authIO)
        .on('connection', (socket) => {
            socket.on('join', () => socket.join('room-' + socket.request.user._id, joinedRoom.bind(socket)));
            socket.on('leave', () => socket.leave('room-' + socket.request.user._id, leftRoom.bind(socket)));
        });

};

function joinedRoom(err) {
    if (err) {
        this.emit('error', new Error('Failed to join room room-' + this.request.user._id));
        log.error(err);
    } else {
        this.emit('joined', {room: 'room-' + this.request.user._id});
        log.info(`User ${this.request.user._id} joined Room room-${this.request.user._id}`);
    }
}

function leftRoom(err) {
    if (err) {
        log.error(err);
    } else {
        log.info(`User ${this.request.user._id} left Room room-${this.request.user._id}`);
    }
}
