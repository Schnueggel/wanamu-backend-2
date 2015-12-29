'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb, createServer } from '../../dist/v1/tools/setup';

describe('App Todolist', function () {
    let server,
        token,
        cookies,
        user;

    before(function (done) {
        setupDb().then( () => {
            server = createServer(9999);
            done();
        }).catch(done);
    });

    after(function () {
        server.close();
    });

    it('Should not get todos', function (done) {
        superagent.get('localhost:9999/v1/todolist/0')
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(401);
                done();
            });
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

    it('Should get todos', function (done) {
        superagent.get('localhost:9999/v1/todolist/' + user.defaultTodolistId)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].title).toEqual('Test todo');
                done();
            });
    });
});