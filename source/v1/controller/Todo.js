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

        const todoDoc = await Todo.findById(ctx.params.id);

        if (!todoDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todo not found');
            ctx.body = result;
            return;
        }

        if (!todoDoc.owner.equals(ctx.user._id)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to edit this user');
            ctx.body = result;
            return;
        }

        const finished = todoDoc.finished;

        Object.assign(todoDoc, _.pick(ctx.request.body, ['title', 'description', 'color', 'finished']));

        try {
            const newTodoDoc = await todoDoc.save(),
                changed = finished !== newTodoDoc.finished;

            if (todoDoc.finished && todoDoc.parent) {
                //TODO update notification and finished count
            }
            result.data = [newTodoDoc.toJSON()];
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
            const data = _.pick(ctx.request.body, ['title', 'description', 'color', 'finished']);
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

    async deleteTodo(ctx) {
        const result = {};

        const todoDoc = await Todo.findOneAndRemove({
            _id: ctx.params.id,
            owner: ctx.user._id
        }).exec();

        if (!todoDoc) {
            ctx.status = 404;
            return;
        }

        result.data = [todoDoc];

        ctx.body = result;
    }

    async getTodo(ctx) {
        const result = {};

        const todoDoc = await Todo.findOne({
            _id: ctx.params.id,
            owner: ctx.user._id
        }).exec();

        if (!todoDoc) {
            ctx.status = 404;
            return;
        }

        result.data = [todoDoc];

        ctx.body = result;
    }
}

export default new TodoController();