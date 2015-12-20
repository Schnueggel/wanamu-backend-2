'use strict';
import superagent from 'superagent';
import expect from 'expect';
import jwt from 'jwt-simple';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';
import config from '../../dist/v1/config';

describe('App Auth', function () {
    let server;
    before(function (done) {
        setUp().then(() => {
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
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data).toBeAn('object');
                expect(res.body.data._id).toBeAn('string');
                expect(res.body.token).toBeAn('string');
                expect(res.body.password).toEqual(undefined);
                expect(jwt.decode(res.body.token, config.WU_JWT_SECRET).id).toEqual(res.body.data._id);
                done();
            });
    });

    it('Should logout', function (done) {
        superagent.post('localhost:9999/v1/auth/logout')
            .type('json')
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                done();
            });
    });
});