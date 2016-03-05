'use strict';
import superagent from 'superagent';
import expect from 'expect';
import jwt from 'jwt-simple';
import { setupDb } from '../../dist/v1/tools/setup';
import config from '../../dist/v1/config';

describe('App Auth', function () {
    let token,
        cookies;

    before(function (done) {
        setupDb().then(() => {
            done();
        }).catch((err) => {
            console.error('Database setup error: ', err);
            done();
        });
    });

    it('Should login', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
            .type('json')
            .send({username: 'christian.steinmann.test@gmail.com', password: '12345678'})
            .end((err, res) => {
                const payload = jwt.decode(res.body.token, config.WU_JWT_SECRET);

                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data[0]).toBeAn('object');
                expect(res.body.data[0]._id).toBeAn('string');
                expect(res.body.token).toBeAn('string');
                expect(res.body.data[0].password).toEqual(undefined);
                expect(payload.email).toEqual(res.body.data[0].email);
                expect(payload.id).toEqual(res.body.data[0]._id);
                expect(res.headers['set-cookie']).toBeAn('array');
                expect(res.headers['set-cookie'][0]).toMatch(/csrf-token.+/);
                token = res.body.token;
                cookies = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should logout', function (done) {
        superagent.post('localhost:9999/v1/auth/logout')
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.headers['set-cookie']).toBeAn('array');
                expect(res.headers['set-cookie'][0]).toMatch(/csrf-token=;.+/);
                done();
            });
    });
});