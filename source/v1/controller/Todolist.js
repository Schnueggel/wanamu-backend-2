import Todo from '../models/Todo';
import errors from '../errors';
import BluePromise from 'bluebird';

export class TodolistController {

    async getTodos(ctx) {
        const result = {};

        const todolist = ctx.user.todolists.id(ctx.params.id);

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