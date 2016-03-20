'use strict';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mongo from './config/mongo';
import router from './config/routes';
import io from './config/socketio';
import redis from './config/redis';
import routesIO from './config/routes.io';
import config from './config';
import http from 'http';
import log from './config/log';
import cors from './middleware/cors';

const v1 = {
    create(server){
        const app = new Koa();

        log.info(config);
        
        mongo.open().catch((err) => {
            throw err;
        });

        app.use(bodyParser())
            .use(cors({credentials: true}))
            .use(async (ctx, next) => {
                const start = new Date;
                await next();
                const ms = new Date - start;
                log.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
            })
            .use(router.routes());

        routesIO(io.create(server));

        app.server = server;

        log.info('V1 App created');

        return app;
    }
};

export default v1;

/**
 * If this app is started as script we create a server and run it
 */
if (!module.parent) {
    const server = http.createServer();
    const app = v1.create(server);

    server.on('request', app.callback());

    server.listen(config.WU_PORT, '0.0.0.0');
}