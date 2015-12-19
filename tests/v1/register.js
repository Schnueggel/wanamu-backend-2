'use strict';
import superagent from 'superagent';
import expect from 'expect';
import app from '../../dist/v1/v1';

describe('App Register', function () {
    before(function (done) {
        app.server = app.listen(9999, '127.0.0.1', done);
    });

    after(function () {
        app.server.close();
    });

    it('Should register', function (done) {
        superagent.post('localhost:9999/v1/register')
            .type('json')
            .send({username: 'testuser', password: 'abcdefghijk', email: 'testemail@email.de', salutation: 'Mr'})
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data).toBeAn('object');
                expect(res.body.data._id).toBeA('string');
                done();
            });
    });

    it('Should not have a valid email', function (done) {
        superagent.post('localhost:9999/v1/register')
            .type('json')
            .send({username: 'testuser', password: 'abcdefghijk', email: 'testemail', salutation: 'Mr'})
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(422);
                expect(res.body).toBeAn('object');
                expect(res.body.error).toBeAn('object');
                expect(res.body.error.name).toEqual('ValidationError');
                expect(res.body.error.errors).toBeAn('array');
                expect(res.body.error.errors.length).toEqual(1);
                expect(res.body.error.errors[0].name).toEqual('email');
                done();
            });
    });
});