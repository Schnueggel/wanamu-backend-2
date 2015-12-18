'use strict';

import Koa from 'koa';
import Router from 'koa-router';

const app  = new Koa(),
    router = new Router({
        prefix: '/v1'
    });

router.get('/test', function (ctx, next) {
    this.body = 'Successfully reached test route on version 1';
});

app.use(router.routes())
    .use(router.allowedMethods());

export default app;