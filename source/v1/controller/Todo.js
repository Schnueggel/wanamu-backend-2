import Todo from '../models/Todo';
import errors from '../errors/index';
import mongoose from 'mongoose';

export class TodoController {

    async create(ctx) {
        const result = {},
            todo = await new Todo(ctx.request.body);

        try {
            result.data = await todo.save();
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                result.error = errors.ValidationError.fromMongooseValidationError(err);
                ctx.status = 422;
            } else if (err.code === 11000) {
                result.error = errors.ValidationError.fromMongoDuplicateError(err);
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