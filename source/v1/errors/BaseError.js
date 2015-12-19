/**
 * @class BaseError
 */
export default class BaseError extends Error {
    /**
     *
     * @param {string} message
     */
    constructor(message){
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor.name);
    }
}