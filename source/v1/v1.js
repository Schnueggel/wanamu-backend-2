'use strict';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import config from './config/mongo';
import router from './config/routes';

const app  = new Koa();

app.use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

export default app;