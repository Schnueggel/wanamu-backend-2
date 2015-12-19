/**
 * @class ValidationError
 */
export default class ValidationError extends Error {
    /**
     *
     * @param {string} message
     * @param {object} errors
     */
    constructor(message, errors){
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor.name);

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