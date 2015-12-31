import authIO from '../middleware/auth.io';

export default (io) => {
    io
        .of('/notification')
        .use(authIO)
        .on('connection', (socket) => {
            socket.on('join', () => socket.join('room-' + socket.request.user._id, joinedRoom.bind(socket)));
            socket.on('leave', () => socket.leave('room-' + socket.request.user._id));
        });

};

function joinedRoom(err) {
    if (err) {
        this.emit('error', new Error('Failed to join room room-' + this.request.user._id));
    } else {
        this.emit('joined', {room: 'room-' + this.request.user._id});
    }

    console.info(`User ${this.request.user._id} join Room room-${this.request.user._id}`);
}
