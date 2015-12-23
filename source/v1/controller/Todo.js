import User from '../models/User';
import Todo from '../models/Todo';
import errors from '../errors';
import mongoose from 'mongoose';
import BluePromise from 'bluebird';
import * as _ from 'lodash';

export class TodoController {

    /**
     * params {
     *    id: <todolistId>
     * }
     * @param {object} ctx
     */
    async updateTodo(ctx) {
        const result = {};

        const todo = await Todo.findById(ctx.params.id);

        if (!todo) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todo not found');
            ctx.body = result;
            return;
        }

        if (!todo.owner.equals(ctx.user._id)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to edit this user');
            ctx.body = result;
            return;
        }

        Object.assign(todo, _.pick(ctx.request.body, ['title', 'description', 'color', 'finished', 'shared']));

        try {
            const newTodo = await todo.save();

            result.data = [newTodo.toJSON()];
        } catch(err) {
            if (err instanceof mongoose.Error.ValidationError) {
                result.error = errors.ValidationError.fromMongooseValidationError(err);
                ctx.status = 422;
            } else {
                result.error = new Error(err.message);
                ctx.status = 500;
            }
        }

        ctx.body = result;
    }

    /**
     * params {
     *    id: <todolistId>
     * }
     * @param {object} ctx
     */
    async createTodo(ctx) {
        const result = {};

        if(!ctx.user.todolists.id(ctx.params.id)) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todolist not found');
            ctx.body = result;
            return;
        }

        try {
            const data = _.pick(ctx.request.body, ['title', 'description', 'color', 'finished', 'shared']);
            data.owner = ctx.user._id;
            data.todolistId = ctx.params.id;

            const todoDoc = await Todo.create(data);

            result.data = [todoDoc.toJSON()];
        } catch(err) {
            if (err instanceof mongoose.Error.ValidationError) {
                result.error = errors.ValidationError.fromMongooseValidationError(err);
                ctx.status = 422;
            } else {
                result.error = new Error(err.message);
                ctx.status = 500;
            }
        }

        ctx.body = result;
    }
}

export default new TodoController();