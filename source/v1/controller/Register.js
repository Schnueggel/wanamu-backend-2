import mongoose from 'mongoose';
import errors from '../errors';
import userService from '../services/user';
import * as _ from 'lodash';

export class RegisterController {

    async register(ctx) {
        const result = {};

        try {
            const userDoc = await userService.createUser(_.pick(ctx.request.body, ['firstname', 'lastname', 'salutation', 'email', 'password', 'avatar', 'username']));
            result.data = [userDoc];
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

export default new RegisterController();