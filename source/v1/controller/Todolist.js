import Todo from '../models/Todo';
import Todolist from '../models/Todolist';
import errors from '../errors';
import mongoose from 'mongoose';
import BluePromise from 'bluebird';

export class TodolistController {

    /**
     *
     * @param ctx
     */
    async getTodos(ctx) {
        const result = {};

        if (!ctx.params.id) {
            ctx.params.id = ctx.user.defaultTodolistId;
        }

        if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) {
            ctx.status = 400;
            result.error = new errors.RequestDataError('Invalid Todolist param');
            ctx.body = result;
            return;
        }

        const todolistDoc = await Todolist.findById(ctx.params.id).exec();

        if (!todolistDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todolist not found');
            ctx.body = result;
            return;
        }

        result.data = await Todo.find({
            todolistId: todolistDoc._id
        }).exec();

        ctx.body = result;
    }
}

export default new TodolistController();