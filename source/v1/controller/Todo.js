import User from '../models/User';
import Todo from '../models/Todo';
import Todolist from '../models/Todolist';
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

        const todolist = await Todolist.findById(ctx.params.id).exec();

        if(!todolist) {
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
            result.error = new errors.NotFoundError('Todo not found');
            ctx.body = result;
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

    /**
     * params {
     *    id: <todoId>
     * }
     * body: {
     *    share: <Array<userId>>
     * }
     * @param ctx
     */
    async shareTodo(ctx) {
        const result = {};

        const todoDoc = await Todo.findById(ctx.params.id).exec();

        if (!todoDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todo not found');
            ctx.body = result;
            return;
        }

        if (todoDoc.finished) {
            ctx.status = 422;
            result.error = new errors.RequestDataError('Cannot share finished todo');
            ctx.body = result;
            return;
        }

        if (!todoDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to share this todo');
            ctx.body = result;
            return;
        }

        let share = ctx.request.body.share || [];

        share = share.filter(v => mongoose.Types.ObjectId.isValid(v));

        const index = share.indexOf(todoDoc.owner);

        if (index > -1) {
            share = share.splice(index, 1);
        }

        if( _.isEmpty(share)) {
            ctx.status = 422;
            result.error = new errors.RequestDataError('Field share must be of type array');
            ctx.body = result;
            return;
        }

        const userForShare = await User.find({
            _id: {
                $in: share
            },
            ingorelist: {
                $nin: share
            },
            friends: {
                $in: [ctx.user._id]
            }
        }).exec();

        if (!userForShare) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('No valid user for sharing');
            ctx.body = result;
            return;
        }

        const todoDocJson = todoDoc.toJSON();

        todoDocJson.parent = todoDoc._id;
        delete todoDocJson._id;


        const todos = userForShare.map(user => {
            todoDocJson.todolistId = user.defaultTodolistId;

            return todoDocJson;
        });

        const todoDocs = await new BluePromise((resolve) => {
            Todo.collection.insert(todos, (err, doc) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve(doc);
                }
            });
        });

        if (todoDocs instanceof Error) {
            ctx.status = 500;
            console.error(todoDocs);
            result.error = new Error('Unable to create shared todos');
            ctx.body = result;
            return;
        }

        result.data = todoDocs.insertedIds;

        ctx.body = result;
    }
}

export default new TodoController();