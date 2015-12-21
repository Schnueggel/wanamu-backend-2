import BaseError from './BaseError';

/**
 * @class ValidationError
 */
export default class NotFoundError extends BaseError {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
    }
}
