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

const v1 = {
    create(server){
        const app = new Koa();

        mongo.open();

        app.use(bodyParser())
            .use(router.routes())
            .use(router.allowedMethods());

        routesIO(io.create(server));

        app.server = server;

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