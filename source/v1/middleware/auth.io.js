import config from '../config';
import User from '../models/User';
import errors from '../errors';
import jwt from 'jwt-simple';

export default (socket, next) => {

    if (!socket.handshake.query.jwt) {
        next(new errors.SocketIOError('[404] Authorization token not found',400));
        return;
    }

    const payload = jwt.decode(socket.handshake.query.jwt, config.WU_JWT_SECRET);

    if (typeof payload !== 'object') {
        next(new errors.SocketIOError('[400] No valid token', 400));
        return;
    }

    if (payload.expires < Date.now()) {
        next(new errors.SocketIOError('[419] Token expired', 419));
        return;
    }

    User.findById(payload.id, {password: 0}, (err, userDoc) => {
        if(err || !userDoc) {
            console.error(err);
            next(new errors.SocketIOError('[404] User not found', 404));
            return;
        }
        socket.request.user = userDoc;
        next();
    });
};
