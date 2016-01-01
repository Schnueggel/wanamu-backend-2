import errors from '../errors';
import mongoose from 'mongoose';

/**
 * Validates mongoose.Types.ObjectIds in the params
 * @param {Array<string>} [params] list of param names that hold and ObjectId
 * @param {Array<string>} [body] list of params in the body that hold ObjectIds
 * @returns {Function}
 */
export default (params = [], body = []) => {
    return async (ctx, next) => {
        const invalidParams = params.find( v => mongoose.Types.ObjectId.isValid(ctx.params[v].toString(0)) === false);

        if (invalidParams) {
            ctx.status = 400;
            ctx.body = {
                error: new errors.RequestDataError('Invalid parameter request parameter')
            };
            return;
        }
        const invalidBody = body.find( v => mongoose.Types.ObjectId.isValid(ctx.request.body[v]) === false);

        if (invalidBody) {
            ctx.status = 400;
            ctx.body = {
                error: new errors.RequestDataError('Invalid parameter request data')
            };
            return;
        }

        await next();
    };
};
