import io from 'socket.io';
import config from './';
import sredis from 'socket.io-redis';
import http from 'http';

export default {
    create(server) {
        const socketio = io(server);

        socketio.adapter(sredis({host: config.WU_REDIS_HOST}));

        return socketio;
    }
};