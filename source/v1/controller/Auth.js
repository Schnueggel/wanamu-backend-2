import User from '../models/User';
import Login from '../models/Login';
import mongoose from 'mongoose';
import errors from '../errors/errors';
import jwt from 'jwt-simple';
import config from '../config';

export class Auth {

    async login(ctx) {
        const result = {};

        const login = new Login(ctx.request.body);

        const err = await login.validate();

        if (err instanceof mongoose.Error.ValidationError) {
            result.error = errors.ValidationError.fromMongooseValidationError(err);
            ctx.status = 422;
            ctx.body = result;
            return;
        } else if (err instanceof Error) {
            console.error(err);
            ctx.status = 500;
            result.error = new Error('Unable to process request');
            ctx.body = result;
            return;
        }


        const user = await User.findOne({
            '$or': [{email: login.username.toLowerCase()}, {username: login.username}]
        });

        if (!user) {
            ctx.status = 404;
            return;
        }
        const isValid = await user.comparePassword(login.password);

        if (!isValid) {
            ctx.status = 403;
            return;
        }

        result.data = user.toJSON();
        delete result.data.password;

        const payload = {
            id: user._id,
            expires: Date.now() + 86400000 // 1 day 86400000 milliseconds
        };

        result.token = jwt.encode(payload, config.WU_JWT_SECRET);

        ctx.body = result;
    }
}

export default new Auth();