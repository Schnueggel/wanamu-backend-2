import {Constants} from '../config/constants';
import config from '../config';
import jwt from 'jwt-simple';

export default function () {
    return (ctx, next) => {
        const csrfToken = ctx.cookies.get(Constants.csrfToken);

        if (!csrfToken) {
            ctx.status = 403;
            ctx.body = {
                error: {
                    message: 'Invalid csrf token'
                }
            };
            return;
        }

        const authHeader = ctx.headers.authorization;

        if (!authHeader) {
            ctx.status = 403;
            ctx.body = {
                error: {
                    message: 'Invalid Authorization header'
                }
            };
            return;
        }

        const jwtToken = authHeader.substring(7);

        if (!jwtToken) {
            ctx.status = 403;
            ctx.body = {
                error: {
                    message: 'Unable to find Token'
                }
            };
            return;
        }

        const payload = jwt.decode(jwtToken, config.WU_JWT_SECRET);

        if (typeof payload !== 'object') {
            ctx.status = 403;
            ctx.body = {
                error: {
                    message: 'Invalid Token'
                }
            };
            return;
        }

        if (payload.csrfToken !== csrfToken) {
            ctx.status = 403;
            ctx.body = {
                error: {
                    message: 'Tokens do not match'
                }
            };
            return;
        }

        ctx.jwtPayload = payload;
        ctx.cookies.set(Constants.csrfToken, csrfToken);

        next();
    };
};