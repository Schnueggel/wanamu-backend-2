import BaseError from './BaseError';

/**
 * @class ValidationError
 */
export default class ValidationError extends BaseError {
    /**
     *
     * @param {string} message
     * @param {object} errors
     */
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }

    static filterErrors(errors) {
        return Object.keys(errors).map(key => {
            return {
                path: key,
                type: errors[key].type,
                message: errors[key].message
            };
        });
    }

    /**
     *
     * @param {mongoose.Error.ValidationError} err
     * @param {string} msg
     * @returns {ValidationError}
     */
    static fromMongooseValidationError(err) {
        return new ValidationError('Validation failed', ValidationError.filterErrors(err.errors));
    }

    /**
     * Turns a MongoError 11000 (Unique constraint error) into a ValidationError
     * @param {MongoError} err
     * @returns {ValidationError}
     */
    static fromMongoDuplicateError(err) {
        const dataMatch = err.message.match(/index: ([a-zA-Z]+)[_0-9]* dup key: { : "(.*)" }/);
        const errors = [];

        if (dataMatch.length === 3) {
            const path = dataMatch[1],
                value = dataMatch[2],
                message = `Field ${path} with value ${value} already exist`;

            errors.push({
                type: 'Duplicate field',
                path,
                message
            });
        }

        return new ValidationError('Validation failed', errors);
    }
}