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
    let io, io2, io3, token, user;

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

    it('Should register to notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient(`${baseUrl}/notification`, opts);

        io.on('register', (data) => {
            expect(data).toBe(true);
            io.close();
            done();
        });
    });

    it('Should multi register to notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient(`${baseUrl}/notification` , opts);
        io2 = ioClient(`${baseUrl}/notification` , opts);

        let mDone = () => () => done();
        io.on('register', (data) => {
            expect(data).toBe(true);
            mDone = mDone();
        });

        io2.on('register', (data) => {
            expect(data).toBe(true);
            mDone = mDone();
        });
    });

    it('Should have 3 connections', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);

        io3 = ioClient(`${baseUrl}/notification`, opts);

        io3.on('getConnections', (data) => {
            expect(data).toBeAn('object');
            expect(data.socketIds).toBeAn('array');
            expect(data.socketIds.length).toEqual(3);
            io.close();
            io2.close();
            io3.close();
            done();
        });

        io3.on('connect', () => {
            io3.emit('getConnections');
        });
    });

    it('Should have 1 connections', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);

        io = ioClient(`${baseUrl}/notification` , opts);

        io.on('getConnections', (data) => {
            expect(data).toBeAn('object');
            expect(data.socketIds).toBeAn('array');
            expect(data.socketIds.length).toEqual(1);
            io.close();
            done();
        });

        io.on('connect', () => {
            io.emit('getConnections');
        });
    });

    it('Should not register to notification', function (done) {
        const opts = Object.assign({query: 'jwt='}, options);
        io = ioClient(`${baseUrl}/notification`, opts);

        io.on('error', (error) => {
            expect(error).toEqual('[404] Authorization token not found');
            done();
        });

        io.on('connect', function() {
            io.emit('register');
        });
    });

});