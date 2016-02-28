import {Constants} from '../config/constants';
import config from '../config';
import User from '../models/User';
import errors from '../errors';
import jwt from 'jwt-simple';
import log from '../config/log';

/**
 * Validates the jwt token
 * @param ctx
 * @param next
 */
export default async (ctx, next) => {
    const csrfToken = ctx.cookies.get(Constants.csrfToken);

    if (!csrfToken) {
        ctx.status = 401;
        ctx.body = {
            error: {
                message: 'Invalid csrf token'
            }
        };

        log.error(ctx.body.error);

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

        log.error(ctx.body.error);

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

        log.error(ctx.body.error);

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

        log.error(ctx.body.error);

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
        ctx.status = 418;
        ctx.body = {
            error: {
                message: 'Token expired'
            }
        };

        log.error(ctx.body.error);

        return;
    }

    const userDoc = await User.findById(payload.id, {password:0}).exec();

    if (!userDoc) {
        log.error(`User ${payload.id} not found`);
        ctx.status = 401;
        ctx.body = {
            error: new errors.NotFoundError('User not found')
        };

        log.error(ctx.body.error);

        return;
    }

    ctx.user = userDoc;
    ctx.jwtPayload = payload;
    ctx.cookies.set(Constants.csrfToken, csrfToken);

    await next();
};
