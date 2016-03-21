'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb } from '../../dist/v1/tools/setup';
import ioClient from 'socket.io-client';
import config from '../../dist/v1/config';

const options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('App Notification', function () {
    let io, token, user, cookies, dbData;

    const baseUrl = `http://localhost:${config.PORT}`;

    before(function (done) {
        setupDb('-notification').then((data) =>  {
            dbData = data;
            done();
        }).catch((err)=> {
            console.error(err);
            done(err);
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

    it('Should connect to notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient(`${baseUrl}/notification`, opts);

        io.on('connect', () => {
            expect(true).toBe(true);
            io.close();
            done();
        });
    });

    it('Should join user room notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient(`${baseUrl}/notification` , opts);

        io.on('joined', (data) => {
            expect(data.room).toEqual('room-' + user._id);
            done();
        });

        io.on('error', (err) => {
            done(err);
        });
    });

    it('Should leave user room notification', function (done) {
        io.on('left', (data) => {
            expect(data.room).toEqual('room-' + user._id);
            done();
        });

        io.emit('leave');

        io.on('error', (err) => {
            done(err);
        });
    });

    it('Should get notifications', function (done) {
        superagent.get(`${baseUrl}/v1/notification`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.page).toEqual(1);
                expect(res.body.limit).toEqual(100);
                expect(res.body.total).toEqual(53);
                expect(res.body.data.length).toEqual(53);
                expect(res.body.data[0].read).toEqual(true);
                done();
            });
    });

    it('Should have pagination', function (done) {
        superagent.get(`${baseUrl}/v1/notification`)
            .query({limit: 10, page:3})
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.page).toEqual(3);
                expect(res.body.limit).toEqual(10);
                expect(res.body.total).toEqual(53);
                expect(res.body.data.length).toEqual(10);
                expect(res.body.data[0].read).toEqual(true);
                done();
            });
    });
});