'use strict';

import Router from 'koa-router';
import register from '../controller/Register';

const router = new Router({
    prefix: '/v1'
});

router.get('/test', function (ctx) {
    ctx.body = 'Successfully reached test route on version 1';
});

router.post('/register', register.register);

export default router;