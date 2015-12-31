import io from 'socket.io';
import config from './';
import sredis from 'socket.io-redis';
import http from 'http';
import socketEmitter from 'socket.io-emitter';

export default {
    emitter: null,
    io: io,
    create(server) {
        const socketio = io(server);
        const adapter = sredis({host: config.WU_REDIS_HOST});

        this.emitter = socketEmitter(adapter.pubClient);
        socketio.adapter(adapter);

        return socketio;
    }
};