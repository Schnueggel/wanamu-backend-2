import User from '../models/User';
import Todo from '../models/Todo';
import errors from '../errors';
import BluePromise from 'bluebird';

export class TodolistController {

    async getTodos(ctx) {
        const result = {},
            userDoc = await User.findById(ctx.jwtPayload.id).exec();

        if (!userDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('User not found');
            ctx.body = result;
            return;
        }

        const todolist = userDoc.todolists.id(ctx.params.id);

        if (!todolist) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todolist not found');
            ctx.body = result;
            return;
        }

        result.data = await Todo.find({
            todolistId: todolist._id
        }).exec();

        ctx.body = result;
    }
}

export default new TodolistController();