import Todo from '../models/Todo';
import errors from '../errors';
import log from '../config/log';

/**
 * Checks if a todo exists and if it belongs to the current user or the user is admin
 * Place this after the auth middleware
 * @param ctx
 * @param next
 */
export default async (ctx, next) => {

    const todoDoc = await Todo.findById(ctx.params.id).exec();

    const result = {};

    if (!todoDoc) {
        log.error(`[404] Todo with id ${ctx.params.id} not found`);
        ctx.status = 404;
        result.error = new errors.NotFoundError('Todo not found');
        ctx.body = result;
        return;
    }

    if (!todoDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
        log.error(`[403] ${ctx.user.username} does not have enough right to get Todo with id ${ctx.params.id}`);
        ctx.status = 403;
        result.error = new errors.AccessDeniedError('Not enough rights to share this todo');
        ctx.body = result;
        return;
    }

    ctx.params.todo = todoDoc;

    await next();
};