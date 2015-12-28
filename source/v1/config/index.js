import nconf from 'nconf';

export class Config {
    static get requiredVars() {
        return ['WU_MONGO', 'WU_JWT_SECRET', 'WU_SOCKET_PORT', 'WU_REDIS_HOST'];
    }
private _WU_REDIS_HOST
    constructor() {
        this.WU_MONGO_AUTOINDEX = true;

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
        const notFoundEnvs = Config.requiredVars.filter( env => this[env] === undefined);

        if (notFoundEnvs.length > 0) {
            throw new Error(`Missing environment vars ${notFoundEnvs.join(',\n')}`);
        }
    }


    get WU_REDIS_HOST() {
        return this._WU_REDIS_HOST;
    }

    set WU_REDIS_HOST(value) {
        this._WU_REDIS_HOST = value;
    }

    get WU_SOCKET_PORT() {
        return this._WU_SOCKET_PORT;
    }

    set WU_SOCKET_PORT(value) {
        this._WU_SOCKET_PORT = value;
    }

    get WU_MONGO() {
        return this._WU_MONGO;
    }

    set WU_MONGO(value) {
        this._WU_MONGO = value;
    }

    get WU_MONGO_AUTOINDEX() {
        return this._WU_MONGO_AUTOINDEX;
    }

    set WU_MONGO_AUTOINDEX(value) {
        this._WU_MONGO_AUTOINDEX = value;
    }

    get WU_JWT_SECRET() {
        return this._WU_JWT_SECRET;
    }

    set WU_JWT_SECRET(value) {
        this._WU_JWT_SECRET = value;
    }


}


export default new Config();
