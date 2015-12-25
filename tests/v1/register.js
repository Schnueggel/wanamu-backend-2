'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';
import { Constants } from '../../dist/v1/config/constants';
import mongoose from 'mongoose';

describe('App Register', function () {
    let server;
    before(function (done) {
        setUp().then( () => {
            server = app.listen(9999, '127.0.0.1', done);
        }).catch(done);
    });

    after(function () {
        server.close();
    });

    it('Should register', function (done) {
        superagent.post('localhost:9999/v1/register')
            .type('json')
            .send({firstname:'test', lastname: 'lastname', username: 'testuser', password: 'abcdefghijk', email: 'testemail@email.de', salutation: 'Mr'})
            .end((err, res) => {console.log(res.body.data[0].defaultTodolistId);
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data).toBeAn('array');
                expect(res.body.data[0]._id).toBeA('string');
                expect(mongoose.Types.ObjectId.isValid(res.body.data[0].defaultTodolistId)).toBe(true);
                done();
            });
    });

    it('Should not have a valid email', function (done) {
        superagent.post('localhost:9999/v1/register')
            .type('json')
            .send({firstname:'test', lastname: 'lastname', username: 'testuser2', password: 'abcdefghijk', email: 'testemail', salutation: 'Mr'})
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(422);
                expect(res.body).toBeAn('object');
                expect(res.body.error).toBeAn('object');
                expect(res.body.error.name).toEqual('ValidationError');
                expect(res.body.error.errors).toBeAn('array');
                expect(res.body.error.errors.length).toEqual(1);
                expect(res.body.error.errors[0].path).toEqual('email');
                done();
            });
    });

    it('Should not allow duplicate email', function (done) {
        superagent.post('localhost:9999/v1/register')
            .type('json')
            .send({firstname:'test', lastname: 'lastname', username: 'testuser2', password: 'abcdefghijk', email: 'testemail@email.de', salutation: 'Mr'})
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(422);
                expect(res.body).toBeAn('object');
                expect(res.body.error).toBeAn('object');
                expect(res.body.error.name).toEqual('ValidationError');
                expect(res.body.error.errors).toBeAn('array');
                expect(res.body.error.errors.length).toEqual(1);
                expect(res.body.error.errors[0].path).toEqual('email');
                done();
            });
    });
});