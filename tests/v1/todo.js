'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';

describe('Todo', function () {
    let server,
        token, token2,
        cookies, cookies2,
        todo,
        dbData,
        user, user2;

    before(function (done) {
        setUp().then( (data) => {
            dbData = data;
            server = app.listen(9999, '127.0.0.1', done);
        }).catch(done);
    });

    after(function () {
        server.close();
    });

    it('Should login', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
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
        superagent.post(`localhost:9999/v1/todo/${user.defaultTodolistId}`)
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

    it('Should have shared todo', function (done) {
        superagent.post(`localhost:9999/v1/todo/${todo._id}/share`)
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
                done(err);
            });
    });


    it('Should login user 2', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
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

    it('Should get new todo', function (done) {
        superagent.get('localhost:9999/v1/todolist/' + user2.defaultTodolistId)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].owner).toEqual(user._id.toString());
                expect(res.body.data[0].parent).toEqual(todo._id.toString());
                done();
            });
    });

    it('Should update todo', function (done) {
        superagent.put(`localhost:9999/v1/todo/${todo._id}`)
            .send({title: 'New Title'})
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title');

                todo = res.body.data[0];
                done();
            });
    });

    it('Should find todo', function (done) {
        superagent.get(`localhost:9999/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title');
                done();
            });
    });

    it('Should share todo', function (done) {
        superagent.get(`localhost:9999/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('New Title');
                done();
            });
    });

    it('Should delete todo', function (done) {
        superagent.delete(`localhost:9999/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should not find deleted todo', function (done) {
        superagent.get(`localhost:9999/v1/todo/${todo._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });
});