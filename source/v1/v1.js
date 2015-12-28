'use strict';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mongo from './config/mongo';
import router from './config/routes';
import io from './config/socketio';
import redis from './config/redis';
import routesIO from './config/routes.io';

const app = new Koa();

mongo.open();

app.use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

routesIO(io);

console.log('Created App');
export default app;
