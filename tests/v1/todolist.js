'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';

describe('App Todolist', function () {
    let server,
        token,
        cookies,
        user;

    before(function (done) {
        setUp().then( () => {
            server = app.listen(9999, '127.0.0.1', done);
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
        superagent.get('localhost:9999/v1/todolist/' + user.todolists[0]._id)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {console.log(res.body);
                expect(res.status).toEqual(200);
                done();
            });
    });
});