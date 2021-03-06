import BaseError from './BaseError';

/**
 * @class NotFoundError
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
