import {Constants} from '../config/constants';
import config from '../config';
import jwt from 'jwt-simple';

export default async (ctx, next) => {
    const csrfToken = ctx.cookies.get(Constants.csrfToken);

    if (!csrfToken) {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Invalid csrf token'
            }
        };
        return;
    }

    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Invalid Authorization header'
            }
        };
        return;
    }

    const jwtToken = authHeader.substring(7);

    if (!jwtToken) {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Unable to find Token'
            }
        };
        return;
    }

    const payload = jwt.decode(jwtToken, config.WU_JWT_SECRET);

    if (typeof payload !== 'object') {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Invalid Token'
            }
        };
        return;
    }

    if (payload.csrfToken !== csrfToken) {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Tokens do not match'
            }
        };
        return;
    }

    if (payload.expires < Date.now()) {
        ctx.status = 419;
        ctx.body = {
            error: {
                message: 'Token expired'
            }
        };
        return;
    }
    ctx.jwtPayload = payload;
    ctx.cookies.set(Constants.csrfToken, csrfToken);

    await next();
};
