import nconf from 'nconf';

export class Config {
    constructor() {

        nconf
            .argv()
            .env({
                separator: '__',
                match: /WU_.+/
            });

        Object.assign(this, nconf.get());

        this.validateConfig();
    }

    validateConfig() {
        const notFoundEnvs = ['WU_MONGO', 'WU_JWT_SECRET'].filter( env => this[env] === undefined);

        if (notFoundEnvs.length > 0) {
            throw new Error(`Missing environment vars ${notFoundEnvs.join(',\n')}`);
        }
    }

    get WU_MONGO() {
        return this._WU_MONGO;
    }

    set WU_MONGO(value) {
        this._WU_MONGO = value;
    }

    get WU_JWT_SECRET() {
        return this._WU_JWT_SECRET;
    }

    set WU_JWT_SECRET(value) {
        this._WU_JWT_SECRET = value;
    }
}


export default new Config();
