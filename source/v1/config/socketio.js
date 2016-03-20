import io from 'socket.io';
import sredis from 'socket.io-redis';
import redis from './redis';
import socketEmitter from 'socket.io-emitter';

export default {
    emitter: null,
    io: io,
    create(server) {
        const socketio = io(server);
        const adapter = sredis({pubClient: redis.createClient(), subClient: redis.createSubClient()});

        this.emitter = socketEmitter(adapter.pubClient);
        socketio.adapter(adapter);

        return socketio;
    }
};