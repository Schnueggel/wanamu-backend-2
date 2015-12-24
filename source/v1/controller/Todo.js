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

        if (!todoDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
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

    /**
     * params {
     *    id: <todoId>
     * }
     * @param ctx
     */
    async deleteTodo(ctx) {
        const result = {};

        const todoDoc = await Todo.findById(ctx.params.id).exec();

        if (!todoDoc) {
            ctx.status = 404;
            return;
        }

        if (!todoDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to delete this todo');
            ctx.body = result;
            return;
        }

        try {
            const removedTodo = await todoDoc.remove();
            result.data = [removedTodo];
        } catch(err) {
            result.error = new Error(err.message);
            ctx.status = 500;
        }

        ctx.body = result;
    }

    /**
     * params {
     *    id: <todoId>
     * }
     * @param ctx
     */
    async getTodo(ctx) {
        const result = {};

        const todoDoc = await Todo.findById(ctx.params.id).exec();

        if (!todoDoc) {
            ctx.status = 404;
            return;
        }

        if (!todoDoc.owner.equals(ctx.user._id)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to read this todo');
            ctx.body = result;
            return;
        }

        result.data = [todoDoc];

        ctx.body = result;
    }

    async shareTodo(ctx) {
        const result = {};

        if( _.isArray(ctx.request.body.share) === false) {
            ctx.status = 422;
            result.error = new errors.RequestDataError('Field share must be of type array');
            ctx.body = result;
            return;
        }

        const allowedToShare = ctx.request.body.share.filter((v) => {
            return ctx.user.shared.indexOf(v) > -1;
        });

        console.log(allowedToShare);

        const todoDoc = await Todo.findById(ctx.params.id).exec();

        if (!todoDoc) {
            ctx.status = 404;
            return;
        }

        if (!todoDoc.owner.equals(ctx.user._id)) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to read this todo');
            ctx.body = result;
            return;
        }
    }
}

export default new TodoController();