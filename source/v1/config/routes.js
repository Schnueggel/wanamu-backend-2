'use strict';

import Router from 'koa-router';
import register from '../controller/Register';
import todolist from '../controller/Todolist';
import todo from '../controller/todo';
import auth from '../controller/Auth';
import authCheck from '../middleware/auth';

const router = new Router({
    prefix: '/v1'
});

router.get('/test', function (ctx) {
    ctx.body = 'Successfully reached test route on version 1';
});

router.post('/register', register.register);

router.post('/auth/login', auth.login);
router.post('/auth/logout', authCheck, auth.logout);

router.get('/todolist/:id', authCheck, todolist.getTodos);

router.post('/todo/:id', authCheck, todo.createTodo);
router.put('/todo/:id', authCheck, todo.updateTodo);

export default router;