import bunyan from 'bunyan';
import config from './';
import cluster from 'cluster';

export default bunyan.createLogger({
    name: config.WU_APP_NAME,
    worker: cluster.isWorker ? cluster.worker.id : 'master',
    version: 'v1'
});