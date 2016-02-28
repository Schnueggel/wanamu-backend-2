import errors from '../errors';
import log from '../config/log';
/**
 * Validates a param against the current user and isAdmin
 * This middleware must be placed after the auth middleware.
 * @returns {Function}
 */
export default (name='id') => {
    return async (ctx, next) => {
        if (!ctx.params[name]) {
            ctx.params[name] = ctx.user._id;
        }

        if (!ctx.user._id.equals(ctx.params[name]) && !ctx.user.isAdmin) {
            ctx.status = 403;
            ctx.body = {
                error: new errors.AccessDeniedError('Not enough rights change this user')
            };

            log.error(ctx.body.error);
        } else {
            await next();
        }
    };
};
