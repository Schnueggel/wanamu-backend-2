'use strict';

import Router from 'koa-router';
import register from '../controller/Register';
import todolist from '../controller/Todolist';
import todo from '../controller/todo';
import auth from '../controller/Auth';
import user from '../controller/User';
import friend from '../controller/Friend';

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
router.delete('/todo/:id', authCheck, todo.deleteTodo);
router.get('/todo/:id', authCheck, todo.getTodo);
router.get('/todo/:id/share', authCheck, todo.shareTodo);

router.delete('/user/:id', authCheck, user.deleteUser);
router.get('/user/:id', authCheck, user.getUser);

//Friends
router.post('/user/:id/friend', authCheck, friend.inviteFriend);
router.post('/user/friend', authCheck, friend.inviteFriend);

router.get('/user/:id/friend', authCheck, friend.getFriends);
router.get('/user/friend', authCheck, friend.getFriends);

router.post('/user/:id/friend/accept', authCheck, friend.acceptInvitation);
router.post('/user/friend/accept', authCheck, friend.acceptInvitation);

router.post('/user/:id/friend/decline', authCheck, friend.declineInvitation);
router.post('/user/friend/decline', authCheck, friend.declineInvitation);

router.delete('/user/:id/friend/:fid', authCheck, friend.deleteFriend);
router.delete('/user/friend/:fid', authCheck, friend.deleteFriend);

export default router;