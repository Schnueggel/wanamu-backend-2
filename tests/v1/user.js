'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';

describe('User', function () {
    let server,
        token,
        cookies,
        dbData,
        user;

    before(function (done) {
        setUp().then((data) => {
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
            .send({username: 'user1', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                user = res.body.data[0];
                token = res.body.token;
                cookies = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should find user', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].username).toEqual(dbData.userDoc1.username);
                expect(res.body.data[0].password).toEqual(undefined);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(res.body.data[0].friends[0]).toEqual(dbData.userDoc2._id.toString());
                done();
            });
    });

    it('Should add friend', function (done) {
        superagent.put(`localhost:9999/v1/user/${user._id}/friends`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .send({friends: [dbData.userDoc3._id]})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(2);
                expect(res.body.data[0]).toEqual(dbData.userDoc2._id.toString());
                expect(res.body.data[1]).toEqual(dbData.userDoc3._id.toString());
                done();
            });
    });
});