import User from '../models/User';
import mongoose from 'mongoose';
import ValidationError from '../errors/ValidationError';

export class Register {

    async register(ctx, next) {
        const user = new User(ctx.request.body),
            result = {
                error: null,
                data: null
            };

        try {
            result.data = await user.save();
        } catch(err) {
            console.log(err.errors);
            if (err instanceof mongoose.Error.ValidationError) {
                result.error = new ValidationError(err.message, err.errors);
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