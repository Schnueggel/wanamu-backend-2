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
    let io, token, user;

    const baseUrl = `http://localhost:${config.WU_PORT}`;

    before(function (done) {
        setupDb().then( () =>  done()).catch(done);
    });

    it('Should login', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'christian.steinmann.test@gmail.com', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                user = res.body.data[0];
                token = res.body.token;
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
});