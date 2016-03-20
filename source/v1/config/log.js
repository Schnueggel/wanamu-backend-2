import bunyan from 'bunyan';
import config from './';
import cluster from 'cluster';

export const options = {
    name: config.WU_APP_NAME,
    worker: cluster.isWorker ? cluster.worker.id : 'master',
    version: 'v1',
    streams: [{
        level: 'info',
        stream: process.stdout
    }]
};

export default bunyan.createLogger(options);