'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb } from '../../dist/v1/tools/setup';
import ioClient from 'socket.io-client';
import config from '../../dist/v1/config';
import {Events as NotifyEvents} from '../../dist/v1/services/notification';

describe('Todo', function () {
    let token, token2,
        cookies, cookies2,
        todo, todo2,
        dbData,
        user, user2;

    const baseUrl = `http://localhost:${config.WU_PORT}`;

    before(function (done) {
        setupDb().then((data) => {
            dbData = data;
            done();
        }).catch(done);
    });


    it('Should login', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'christian.steinmann.test@gmail.com', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                user = res.body.data[0];
                token = res.body.token;
                cookies = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should create todo', function (done) {
        superagent.post(`${baseUrl}/v1/todo/${user.defaultTodolistId}`)
            .send({
                title: 'title',
                description: 'description',
                color: 'color1'
            })
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('title');
                expect(res.body.data[0].description).toEqual('description');
                todo = res.body.data[0];
                done(err);
            });
    });

    it('Should share todo', function (done) {
        superagent.post(`${baseUrl}/v1/todo/${todo._id}/share`)
            .send({
                share: [dbData.userDoc2._id]
            })
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].shared.indexOf(dbData.userDoc2._id.toString())).toEqual(0);
                done(err);
            });
    });

    it('Should find sharing user', function (done) {
        superagent.get(`${baseUrl}/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data[0].shared[0]).toEqual(dbData.userDoc2._id.toString());
                done();
            });
    });

    it('Should not share todo', function (done) {
        superagent.post(`${baseUrl}/v1/todo/${todo._id}/share`)
            .send({
                share: [dbData.userDoc2._id]
            })
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(204);
                done(err);
            });
    });

    it('Should login user 2', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'user2', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                user2 = res.body.data[0];
                token2 = res.body.token;
                cookies2 = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should have shared todo', function (done) {
        superagent.get(`${baseUrl}/v1/todolist/${user2.defaultTodolistId}`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].owner).toEqual(user2._id.toString());
                expect(res.body.data[0].parent).toEqual(todo._id.toString());
                todo2 = res.body.data[0];
                done();
            });
    });

    it('Should accept shared todo', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, {
                transports: ['websocket'],
                'force new connection': true
            }),
            io = ioClient(`${baseUrl}/notification`, opts);

        io.on(NotifyEvents.Shared_Todo_Accepted, (data) => {
            expect(data.owner).toEqual(user._id);
            done();
        });

        io.on('connect', () => {
            superagent.put(`${baseUrl}/v1/todo/${todo2._id}/accept`)
                .set('Cookie', cookies2)
                .set('Authorization', `Bearer ${token2}`)
                .type('json')
                .end((err, res) => {
                    expect(res.status).toEqual(200);
                    expect(res.body.data).toBeAn('array');
                    expect(res.body.data.length).toEqual(1);
                    expect(res.body.data[0].accepted).toEqual(true);
                });
        });
    });

    it('Should finish shared todo', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, {
                transports: ['websocket'],
                'force new connection': true
            }),
            io = ioClient(`${baseUrl}/notification`, opts);

        io.on(NotifyEvents.Shared_Todo_Finished, (data) => {
            expect(data.owner).toEqual(user._id);
            done();
        });

        io.on('connect', () => {
            superagent.put(`${baseUrl}/v1/todo/${todo2._id}/finish`)
                .set('Cookie', cookies2)
                .set('Authorization', `Bearer ${token2}`)
                .type('json')
                .end((err, res) => {
                    expect(res.status).toEqual(200);
                    expect(res.body.data).toBeAn('array');
                    expect(res.body.data.length).toEqual(1);
                    expect(res.body.data[0].finished).toEqual(true);
                });
        });
    });

    it('Should unshare todo', function (done) {
        superagent.put(`${baseUrl}/v1/todo/${todo._id}/unshare/${user2._id}`)
            .send({})
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].owner).toEqual(user._id.toString());
                expect(res.body.data[0].shared.indexOf(user2._id.toString())).toEqual(-1);
                done(err);
            });
    });

    it('Should update todo', function (done) {
        superagent.put(`${baseUrl}/v1/todo/${todo._id}`)
            .send({title: 'New Title!!!'})
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title!!!');
                todo = res.body.data[0];
                done();
            });
    });

    it('Should find updated todo', function (done) {
        superagent.get(`${baseUrl}/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title!!!');
                done();
            });
    });

    it('Should not find todo', function (done) {
        superagent.get(`${baseUrl}/v1/todo/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });

    it('Should share todo', function (done) {
        superagent.get(`${baseUrl}/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title!!!');
                done();
            });
    });

    it('Should delete todo', function (done) {
        superagent.delete(`${baseUrl}/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should not find deleted todo', function (done) {
        superagent.get(`${baseUrl}/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });
});