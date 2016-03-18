import nconf from 'nconf';
import fs from 'fs';
import path from 'path';

export class Config {
    static get requiredVars() {
        return ['WU_MONGO', 'WU_JWT_SECRET', 'WU_SOCKET_PORT', 'WU_REDIS_HOST', 'WU_PORT'];
    }

    constructor() {
        this.WU_MONGO_AUTOINDEX = true;

        nconf.argv();

        //Use this path for dev env only for production and staging use environment vars
        const configPath = path.join(__dirname, 'config.js');

        if (fs.statSync(configPath).isFile()) {
            nconf.defaults(require(configPath).default);
        }

        nconf.env({
            separator: '__',
            match: /WU_.+/
        });

        Object.assign(this, nconf.get());

        this.validateConfig();
    }

    validateConfig() {
        const notFoundEnvs = Config.requiredVars.filter(env => this[env] === undefined);

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

    get WU_PORT() {
        return this._WU_PORT;
    }

    set WU_PORT(value) {
        this._WU_PORT = value;
    }

    get WU_APP_NAME() {
        return this._WU_APP_NAME;
    }

    set WU_APP_NAME(value) {
        this._WU_APP_NAME = value;
    }
}


export default new Config();
