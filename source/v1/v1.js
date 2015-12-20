'use strict';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mongo from './config/mongo';
import router from './config/routes';

const app = new Koa();

mongo.open();

app.use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

console.log('Created App');
export default app;
