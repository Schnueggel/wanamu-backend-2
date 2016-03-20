'use strict';

import Koa from 'koa';
import mount from 'koa-mount';
import rewrite from 'koa-rewrite';
import cluster from 'cluster';
import os from 'os';
import http from 'http';

import v1 from './v1/v1.js';
import config from './v1/config';
import log from './v1/config/log';

/**
 * TODO Perhaps we should use pm2 to create the cluster but if we want to proxy socket.io polling perhaps difficult
 */
export class Cluster {

    constructor(cpus=1) {
        this.workers = [];

        if (cpus === -1) {
            cpus = os.cpus();
        }
        
        if (cluster.isMaster) {
            log.info('Master starts');
            for (let i = 0; i < cpus; i++) {
                this.workers[i] = cluster.fork();
            }
            cluster.on('exit', this.onExit.bind(this));
        } else {
            this.createApp();
        }
    }

    createApp() {
        const app = new Koa(),
            port = config.WU_PORT;

        //Rewrite all request without version to the default version
        app.use(rewrite(/^\/([^v\d].+)/, '/v1/$1'));

        const server = http.createServer();
        //Mount each version as independent app
        app.use(mount(v1.create(server)));
        // On every request run the koa app callback
        server.on('request', app.callback());

        server.listen(port, '0.0.0.0', () => {
            log.info('Wanamu backend 2 started at port ' + port);
        });
    }

    onExit(worker) {
        log.error(`Worker with id %${worker.id} died`);
        this.workers.forEach( (v,i)=> {
            if (v === worker) {
                this.workers[i] = cluster.fork();
            }
        });
    }

    get workers () {
        return this._workers;
    }

    set workers(value) {
        this._workers = value;
    }
}

if (!module.parent) {
    new Cluster(process.env.WU_CPUS || os.cpus().length);
}