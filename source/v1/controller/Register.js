import User from '../models/User';
import mongoose from 'mongoose';
import errors from '../errors/errors';

export class Register {

    async register(ctx, next) {
        const user = new User(ctx.request.body),
            result = {
                error: null,
                data: null
            };

        try {
            result.data = await user.save();
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

export default new Register();