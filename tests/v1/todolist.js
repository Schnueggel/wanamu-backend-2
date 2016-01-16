'use strict';
import superagent from 'superagent';
import expect from 'expect';
import config from '../../dist/v1/config';
import { setupDb } from '../../dist/v1/tools/setup';

describe('App Todolist', function () {
    let token,
        cookies,
        dbData,
        user;

    const baseUrl = `http://localhost:${config.WU_PORT}`;

    before(function (done) {
        setupDb().then( (data) => {
            dbData = data;
            done();
        }).catch(done);
    });

    it('Should not get todos', function (done) {
        superagent.get(`${baseUrl}/v1/todolist/0`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(401);
                done();
            });
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

    it('Should get todos', function (done) {
        superagent.get(`${baseUrl}/v1/todolist/${user.defaultTodolistId}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(2);
                expect(res.body.data[0].title).toEqual('Test todo');
                expect(res.body.page).toEqual(1);
                expect(res.body.limit).toEqual(100);
                expect(res.body.total).toEqual(2);
                expect(res.body.data[0].sharedInfo).toBeAn('object');
                expect(res.body.data[0].sharedInfo.acceptedCount).toEqual(1);
                expect(res.body.data[0].sharedInfo.finishedCount).toEqual(0);
                expect(res.body.data[0].sharedInfo.info).toBeAn('array');
                expect(res.body.data[0].sharedInfo.info.length).toEqual(1);
                expect(res.body.data[0].sharedInfo.info[0].username).toEqual(dbData.userDoc2.username);
                done();
            });
    });

    it('Should be out of range', function (done) {
        superagent.get(`${baseUrl}/v1/todolist/${user.defaultTodolistId}?page=2`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(0);
                expect(res.body.page).toEqual(2);
                expect(res.body.limit).toEqual(100);
                expect(res.body.total).toEqual(2);
                done();
            });
    });

    it('Should be valid todolistId', function (done) {
        superagent.get(`${baseUrl}/v1/todolist/33`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(400);
                done();
            });
    });
});