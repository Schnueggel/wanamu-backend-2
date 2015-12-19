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
    constructor(message, errors){
        super(message);
        this.errors = this.filterErrors(errors);
    }

    filterErrors(errors) {
        return Object.keys(errors).map( key => {
            return {
                name: key,
                message: errors[key].message
            };
        });
    }
}