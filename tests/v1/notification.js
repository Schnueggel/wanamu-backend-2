'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import ioClient from 'socket.io-client';
import app from '../../dist/v1/v1';

const options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('App Notification', function () {
    let server, io, io2, io3, token, user;

    before(function (done) {
        setUp().then( () => {
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
                expect(res.status).toEqual(200);
                user = res.body.data[0];
                token = res.body.token;
                done();
            });
    });

    it('Should register to notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient('http://localhost:8888/notification', opts);

        io.on('register', (data) => {
            expect(data).toBe(true);
            io.close();
            done();
        });
    });

    it('Should multi register to notification', function (done) {
        const opts = Object.assign({query: 'jwt=' + token}, options);
        io = ioClient('http://localhost:8888/notification', opts);
        io2 = ioClient('http://localhost:8888/notification', opts);

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

        io3 = ioClient('http://localhost:8888/notification', opts);

        io3.on('getConnections', (data) => {
            console.log(data);
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

        io = ioClient('http://localhost:8888/notification', opts);

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
        io = ioClient('http://localhost:8888/notification', opts);

        io.on('error', (error) => {
            expect(error).toEqual('[404] Authorization token not found');
            done();
        });

        io.on('connect', function() {
            io.emit('register');
        });
    });

});