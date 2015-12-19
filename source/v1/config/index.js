import nconf from 'nconf';

export class Config {

    constructor() {

        this.initConfig();

        nconf.argv();
        //Config from env with prefix WU_ will overwrite the default conf
        nconf.env({
            separator: '__',
            match: /WU_.+/
        });
    }

    initConfig() {
        this.WU_MONGO = 'mongodb://localhost:27017/wanamu';
    }

    get WU_MONGO() {
        return this._WU_MONGO;
    }

    set WU_MONGO(value) {
        this._WU_MONGO = value;
    }
}


export default new Config();
