import nconf from 'nconf';
import fs from 'fs';
import path from 'path';

/**
 * Possible env vars:
 * WU_MONGO_HOST: localhost,
 * WU_MONGO_PORT: 27017,
 * WU_MONGO_USER: only set if there is a user,
 * WU_MONGO_PASSWORD: only set if there is a password
 * WU_MONGO_DB: wanamu-test,
 * WU_JWT_SECRET: This must be set and should not be changed. If you change all current tokens will be invalid,
 * WU_LOGGER_TOKEN: only set if there is a logger token,
 * WU_REDIS_HOST: localhost,
 * WU_REDIS_PORT: 6379,
 * WU_REDIS_PASSWORD: only set if there is one,
 * PORT: 9999,
 * WU_CPUS: -1 for all cpus
 * WU_APP_NAME: Wuhuhu
 */
export class Config {
    static get requiredVars() {
        return ['WU_MONGO_DB', 'WU_MONGO_HOST', 'WU_MONGO_PORT',  'WU_JWT_SECRET', 'WU_REDIS_HOST', 'PORT', 'WU_REDIS_PORT'];
    }

    constructor() {
        this.WU_MONGO_AUTOINDEX = true;

        nconf.argv();

        nconf.env({
            separator: '__',
            match: /WU_.+/
        });

        //Use this path for dev env only for production and staging use environment vars
        const configPath = path.join(__dirname, 'config.js');

        try{
            fs.statSync(configPath);
            nconf.defaults(require(configPath).default);
        } catch(err){
            console.log(err);
            console.log('No local config file found');
        }

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
