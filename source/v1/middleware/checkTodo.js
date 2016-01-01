import Todo from '../models/Todo';
import errors from '../errors';
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
        ctx.status = 404;
        result.error = new errors.NotFoundError('Todo not found');
        ctx.body = result;
        return;
    }

    if (!todoDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
        ctx.status = 403;
        result.error = new errors.AccessDeniedError('Not enough rights to share this todo');
        ctx.body = result;
        return;
    }

    ctx.params.todo = todoDoc;

    await next();
};