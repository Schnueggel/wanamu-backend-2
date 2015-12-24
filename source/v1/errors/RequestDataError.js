import BaseError from './BaseError';

/**
 * @class RequestDataError
 */
export default class RequestDataError extends BaseError {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
    }
}
