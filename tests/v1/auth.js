'use strict';
import superagent from 'superagent';
import expect from 'expect';
import app from '../../dist/v1/v1';

describe('App Auth', function () {
    before(function (done) {
        app.server = app.listen(9999, '127.0.0.1', done);
    });

    after(function () {
        app.server.close();
    });

    it('Should login', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
            .type('json')
            .send({username: 'testuser', password: 'abcdefghijk'})
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data).toBeAn('object');
                expect(res.body.data.id).toBeAn('number');
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