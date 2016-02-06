'use strict';

import Router from 'koa-router';
import register from '../controller/Register';
import todolist from '../controller/Todolist';
import todo from '../controller/todo';
import auth from '../controller/Auth';
import user from '../controller/User';
import friend from '../controller/Friend';
import notification from '../controller/Notification';

import pagination from '../middleware/pagination';
import authCheck from '../middleware/auth';
import checkUserId from '../middleware/checkUserId';
import validObjectId from '../middleware/validObjectId';
import checkTodo from '../middleware/checkTodo';

const checkUserIdMw = checkUserId();

const validObjectIdUsrFrMw = validObjectId(['id'],['fid']);
const validId = validObjectId(['id']);
const router = new Router({
    prefix: '/v1'
});

router.get('/test', function (ctx) {
    ctx.body = 'Successfully reached test route on version 1';
});

router.post('/register', register.register);

router.post('/auth/login', auth.login);
router.post('/auth/logout', authCheck, auth.logout);

router.get('/todolist/:id', authCheck, validId, pagination, todolist.getTodos);
router.get('/todolist', authCheck, pagination, todolist.getTodos);

router.post('/todo/:id', authCheck, validId, todo.createTodo);
router.put('/todo/:id', authCheck, validId, checkTodo, todo.updateTodo);
router.delete('/todo/:id', authCheck, validId, checkTodo,  todo.deleteTodo);
router.get('/todo/:id', authCheck, validId, checkTodo, todo.getTodo);
router.post('/todo/:id/share', authCheck, validId, checkTodo, todo.shareTodo);
router.put('/todo/:id/accept', authCheck, validId, checkTodo, todo.acceptTodo);
router.put('/todo/:id/finish', authCheck, validId, checkTodo, todo.finishTodo);
router.put('/todo/:id/unshare/:uid', authCheck, validId, checkTodo, todo.unShareTodo);

router.delete('/user/:id', authCheck, checkUserIdMw, user.deleteUser);
router.delete('/user', authCheck, checkUserIdMw, user.deleteUser);

router.get('/user/:id', authCheck, checkUserIdMw, user.getUser);
router.get('/user', authCheck, checkUserIdMw, user.getUser);

router.post('/user/:id/ignore', authCheck, checkUserIdMw, validObjectId(['id'],['id']), user.ignoreUser);
router.post('/user/ignore', authCheck, checkUserIdMw, validObjectId(['id'], ['id']), user.ignoreUser);
router.get('/user/username/:username', user.userNameCheck);
router.get('/user/username', user.userNameCheck);

//Friends
router.post('/user/:id/friend', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.inviteFriend);
router.post('/user/friend', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.inviteFriend);

router.get('/user/:id/friend', authCheck, checkUserIdMw, friend.getFriends);
router.get('/user/friend', authCheck, checkUserIdMw, friend.getFriends);

router.post('/user/:id/friend/accept', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.acceptInvitation);
router.post('/user/friend/accept', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.acceptInvitation);

router.post('/user/:id/friend/decline', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.declineInvitation);
router.post('/user/friend/decline', authCheck, checkUserIdMw, validObjectIdUsrFrMw, friend.declineInvitation);

router.delete('/user/:id/friend/:fid', authCheck, checkUserIdMw, validObjectId(['id', 'fid']), friend.deleteFriend);
router.delete('/user/friend/:fid', authCheck, checkUserIdMw, validObjectId(['id', 'fid']), friend.deleteFriend);

router.get('/notification', authCheck, pagination, notification.getNotifications);

export default router;