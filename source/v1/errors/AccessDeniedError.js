import BaseError from './BaseError';

/**
 * @class AccessDeniedError
 */
export default class AccessDeniedError extends BaseError {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
    }
}
