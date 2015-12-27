import BaseError from './BaseError';

/**
 * @class SocketIOError
 */
export default class SocketIOError extends BaseError {
    /**
     *
     * @param {string} message
     */
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
