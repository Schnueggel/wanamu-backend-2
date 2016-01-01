import Todo from '../models/Todo';
import Todolist from '../models/Todolist';
import errors from '../errors';
import mongoose from 'mongoose';
import BluePromise from 'bluebird';
import todoService from '../services/todo';

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

        const todolistDoc = await Todolist.findById(ctx.params.id).exec();

        if (!todolistDoc) {
            ctx.status = 404;
            result.error = new errors.NotFoundError('Todolist not found');
            ctx.body = result;
            return;
        }

        if (!todolistDoc.owner.equals(ctx.user._id) && !ctx.user.isAdmin) {
            ctx.status = 403;
            result.error = new errors.AccessDeniedError('Not enough rights to query this todolist');
            ctx.body = result;
            return;
        }

        result.data = await todoService.getTodos({todolistId:todolistDoc._id}, ctx.request.query.page, ctx.request.query.limit);
        result.total = await todoService.getTodosCount({todolistId:todolistDoc._id});
        result.page = ctx.request.query.page;
        result.limit = ctx.request.query.limit;

        ctx.body = result;
    }
}

export default new TodolistController();