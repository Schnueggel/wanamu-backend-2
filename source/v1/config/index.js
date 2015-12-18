import * as nconf from 'nconf';

export class Config {

    constructor() {
        nconf.argv();


        //Config from env with prefix WU_ will overwrite the default conf
        nconf.env({
            separator: '__',
            match: /WU_.+/
        });
    }
}


export default config = new Config();
