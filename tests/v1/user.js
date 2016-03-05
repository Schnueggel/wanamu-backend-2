'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb} from '../../dist/v1/tools/setup';
import ioClient from 'socket.io-client';
import config from '../../dist/v1/config';
import {Events as NotifyEvents} from '../../dist/v1/services/notification';

describe('User', function () {
    let token,token2, token3,
        cookies, cookies2, cookies3,
        dbData,
        user, user2, user3;

    const baseUrl = `http://localhost:${config.WU_PORT}`;

    before(function (done) {
        setupDb().then((data) => {
            dbData = data;
            done();
        }).catch(done);
    });

    it('Should login', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'user1', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data[0].username).toBe('user1');
                expect(res.body.data[0].salutation).toBe('Mr');
                user = res.body.data[0];
                token = res.body.token;
                cookies = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });


    it('Should check username with true', function (done) {
        superagent.get(`${baseUrl}/v1/user/username/user1`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toEqual(true);
                done();
            });
    });

    it('Should check username with false', function (done) {
        superagent.get(`${baseUrl}/v1/user/username/hhhh`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toEqual(false);
                done();
            });
    });

    it('Should find user', function (done) {
        superagent.get(`${baseUrl}/v1/user/${user._id}`)
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

    it('Should invite friend', function (done) {
        superagent.post(`${baseUrl}/v1/friend/${user._id}/invite`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .send({fid: dbData.userDoc3._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should login user 3', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'user3', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data[0].username).toBe('user3');
                expect(res.body.data[0].salutation).toBe('Mr');
                user3 = res.body.data[0];
                token3 = res.body.token;
                cookies3 = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should accept friend', function (done) {
        const opts = Object.assign({query: 'jwt=' + token3}, {
                transports: ['websocket'],
                'force new connection': true
            }),
            io = ioClient(`${baseUrl}/notification`, opts);

        io.on(NotifyEvents.Friend_Accepted, (data) => {
            expect(data.meta._id).toEqual(dbData.userDoc1._id.toString());
            expect(data.meta.username).toEqual(dbData.userDoc1.username);
            expect(data.meta.firstname).toEqual(dbData.userDoc1.firstname);
            expect(data.meta.lastname).toEqual(dbData.userDoc1.lastname);
            done();
        });

        superagent.post(`${baseUrl}/v1/friend/accept`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .send({fid: dbData.userDoc1._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
            });
    });

    it('Should find user with new friend', function (done) {
        superagent.get(`${baseUrl}/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].username).toEqual(dbData.userDoc1.username);
                expect(res.body.data[0].password).toEqual(undefined);
                expect(res.body.data[0].friends.length).toEqual(2);
                expect(res.body.data[0].friends[0]).toEqual(dbData.userDoc2._id.toString());
                expect(res.body.data[0].friends[1]).toEqual(dbData.userDoc3._id.toString());
                done();
            });
    });

    it('Should login user 2', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'user2', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data[0].username).toBe('user2');
                expect(res.body.data[0].salutation).toBe('Mr');
                user2 = res.body.data[0];
                token2 = res.body.token;
                cookies2 = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should invite friend 2', function (done) {
        superagent.post(`${baseUrl}/v1/friend/${user3._id}/invite`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .send({fid: dbData.userDoc2._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should get friends pending', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user3._id}`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(2);
                expect(res.body.data[1].pending).toEqual(true);
                expect(res.body.data[0].pending).toEqual(false);
                done();
            });
    });

    it('Should get friends invitation', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user2._id}`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(2);
                expect(res.body.data[1].invitation).toEqual(true);
                expect(res.body.data[0].invitation).toEqual(false);
                done();
            });
    });

    it('Should decline friend', function (done) {
        superagent.post(`${baseUrl}/v1/friend/decline`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .send({fid: dbData.userDoc3._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should get friends with no more invitation', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user2._id}`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].invitation).toEqual(false);
                done();
            });
    });

    it('Should get friends with no pending', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user3._id}`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].pending).toEqual(false);
                done();
            });
    });

    it('Should get friends', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(2);
                done();
            });
    });

    it('Should delete friends', function (done) {
        superagent.delete(`${baseUrl}/v1/friend/${user2._id}/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should get friends without deleted friend', function (done) {
        superagent.get(`${baseUrl}/v1/friend/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                done();
            });
    });

    it('Should ignore user', function (done) {
        superagent.post(`${baseUrl}/v1/user/${user._id}/ignore`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .send({id: user2._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should not be friends anymore', function (done) {
        superagent.get(`${baseUrl}/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data.indexOf(user2._id.toString())).toEqual(-1);
                done();
            });
    });

    it('Should have friend removed', function (done) {
        superagent.get(`${baseUrl}/v1/user/${user2._id}`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].friends.indexOf(user._id.toString())).toEqual(-1);
                done();
            });
    });

    it('Should not allow friend invitation', function (done) {
        superagent.post(`${baseUrl}/v1/friend/${user2._id}`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .send({fid: dbData.userDoc1._id})
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });

    it('Should delete user', function (done) {
        superagent.delete(`${baseUrl}/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should not find user', function (done) {
        superagent.get(`${baseUrl}/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(401);
                done();
            });
    });

    it('Should login as admin', function (done) {
        superagent.post(`${baseUrl}/v1/auth/login`)
            .type('json')
            .send({username: 'user3', password: '12345678'})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                user = res.body.data[0];
                token = res.body.token;
                cookies = [res.headers['set-cookie'][0].match(/(csrf-token=[^;]+); /)[1]];
                done();
            });
    });

    it('Should delete user by admin', function (done) {
        superagent.delete(`${baseUrl}/v1/user/${dbData.userDoc2._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].password).toEqual(undefined);
                done();
            });
    });

    it('Should not find user deleted by admin', function (done) {
        superagent.get(`${baseUrl}/v1/user/${dbData.userDoc2._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });
});