import User from '../models/User';
import Login from '../models/Login';
import mongoose from 'mongoose';
import errors from '../errors';
import jwt from 'jwt-simple';
import config from '../config';
import bcrypt from 'bcrypt';
import BluePromise from 'bluebird';
import { Constants } from '../config/constants';

export class Auth {

    async login(ctx) {
        const result = {};

        const login = new Login(ctx.request.body);

        try {
            await login.validate();
        }catch(err) {
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
        }

        const user = await User.findOne({
            '$or': [{email: login.username.toLowerCase()}, {username: login.username}]
        }).exec();

        if (!user) {
            ctx.status = 404;
            return;
        }

        const isValid = await user.comparePassword(login.password);

        if (!isValid) {
            ctx.status = 403;
            return;
        }

        result.data = [user.toJSON()];
        delete result.data[0].password;

        const csrfToken = await new BluePromise((resolve) => {
            bcrypt.hash(user.email, 1, (err, hash) => {
                resolve(hash);
            });
        });

        const payload = {
            email: user.email,
            id: user._id,
            expires: Date.now() + 86400000, // 1 day 86400000 milliseconds
            csrfToken
        };

        ctx.cookies.set(Constants.csrfToken, csrfToken);

        result.token = jwt.encode(payload, config.WU_JWT_SECRET);
        result.token_expires = payload.expires;

        ctx.body = result;
    }

    async logout(ctx) {
        ctx.status = 200;
        ctx.cookies.set(Constants.csrfToken, null, {overwrite: true});
    }
}

export default new Auth();