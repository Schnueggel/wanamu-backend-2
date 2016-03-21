import nconf from 'nconf';
import fs from 'fs';
import path from 'path';

export class Config {
    static get requiredVars() {
        return ['WU_MONGO_DB', 'WU_MONGO_HOST', 'WU_MONGO_PORT',  'WU_JWT_SECRET', 'WU_REDIS_HOST', 'PORT', 'WU_REDIS_PORT'];
    }

    constructor() {
        this.WU_MONGO_AUTOINDEX = true;

        nconf.argv();

        //Use this path for dev env only for production and staging use environment vars
        const configPath = path.join(__dirname, 'config.js');

        try{
            fs.statSync(configPath);
            nconf.defaults(require(configPath).default);
        } catch(err){}

        nconf.env({
            separator: '__',
            match: /WU_.+/
        });

        this.PORT = process.env.PORT;

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

    get WU_REDIS_PORT () { return this._WU_REDIS_PORT; }
    set WU_REDIS_PORT (value) { this._WU_REDIS_PORT = value; }

    get WU_REDIS_PASSWORD () { return this._WU_REDIS_PASSWORD; }
    set WU_REDIS_PASSWORD (value) { this._WU_REDIS_PASSWORD = value; }

    get WU_MONGO() {
        const auth = this.WU_MONGO_USER ? this.WU_MONGO_USER + ':' + this.WU_MONGO_PASSWORD  + '@' : '';
        return `mongodb://${auth}${this.WU_MONGO_HOST}:${this.WU_MONGO_PORT}/${this.WU_MONGO_DB}`;
    }

    get WU_MONGO_AUTOINDEX() {
        return this._WU_MONGO_AUTOINDEX;
    }

    set WU_MONGO_AUTOINDEX(value) {
        this._WU_MONGO_AUTOINDEX = value;
    }

    get WU_LOGGER_TOKEN () { return this._WU_LOGGER_TOKEN; }
    set WU_LOGGER_TOKEN (value) { this._WU_LOGGER_TOKEN = value; }

    get WU_MONGO_USER () { return this._WU_MONGO_USER; }
    set WU_MONGO_USER (value) { this._WU_MONGO_USER = value; }

    get WU_MONGO_PASSWORD () { return this._WU_MONGO_PASSWORD; }
    set WU_MONGO_PASSWORD (value) { this._WU_MONGO_PASSWORD = value; }

    get WU_JWT_SECRET() {
        return this._WU_JWT_SECRET;
    }

    set WU_JWT_SECRET(value) {
        this._WU_JWT_SECRET = value;
    }

    get PORT() {
        return this._PORT;
    }

    set PORT(value) {
        this._PORT = value;
    }

    get WU_APP_NAME() {
        return this._WU_APP_NAME;
    }

    set WU_APP_NAME(value) {
        this._WU_APP_NAME = value;
    }

    get WU_MONGO_HOST () { return this._WU_MONGO_HOST; }
    set WU_MONGO_HOST (value) { this._WU_MONGO_HOST = value; }

    get WU_MONGO_PORT () { return this._WU_MONGO_PORT; }
    set WU_MONGO_PORT (value) { this._WU_MONGO_PORT = value; }

    get WU_MONGO_DB () { return this._WU_MONGO_DB; }
    set WU_MONGO_DB (value) { this._WU_MONGO_DB = value; }
}


export default new Config();
