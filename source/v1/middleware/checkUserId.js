import errors from '../errors';

/**
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
        } else {
            await next();
        }
    };
};
