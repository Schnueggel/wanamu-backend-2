import bunyan from 'bunyan';
import bunyanLogentries from 'bunyan-logentries';
import config from './';
import cluster from 'cluster';

export const options = {
    name: config.WU_APP_NAME,
    worker: cluster.isWorker ? cluster.worker.id : 'master',
    version: 'v1'
};

if (config.WU_LOGGER_TOKEN) {
    options.streams = [{
        level: 'info',
        stream: bunyanLogentries.createStream({token: config.WU_LOGGER_TOKEN}),
        type: 'raw'
    }];
}

export default bunyan.createLogger(options);