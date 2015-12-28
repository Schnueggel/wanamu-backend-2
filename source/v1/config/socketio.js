import io from 'socket.io';
import config from './';
import sredis from 'socket.io-redis';

const socketio = io(config.WU_SOCKET_PORT);

socketio.adapter(sredis({host: config.WU_REDIS_HOST}));

export default socketio;