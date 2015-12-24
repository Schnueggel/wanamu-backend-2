import User from '../models/User';
import Todolist from '../models/Todolist';
import mongoose from 'mongoose';
import errors from '../errors';
import { Constants } from '../config/constants';
import * as _ from 'lodash';

export class RegisterController {

    async register(ctx) {
        const user = new User(_.pick(ctx.request.body, ['firstname', 'lastname', 'salutation', 'email', 'password', 'avatar', 'username'])),
            result = {
                error: null,
                data: null
            };
        try {
            user.todolists.push(new Todolist({name: Constants.defaultTodolistName, defaultList: true}));
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

export default new RegisterController();