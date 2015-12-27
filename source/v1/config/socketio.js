import io from 'socket.io';
import config from './';

const socketio = io(config.WU_SOCKET_PORT);

export default socketio;