'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb, createServer } from '../../dist/v1/tools/setup';

describe('User', function () {
    let server,
        token,token2, token3,
        cookies, cookies2, cookies3,
        dbData,
        user, user2, user3;

    before(function (done) {
        setupDb().then((data) => {
            dbData = data;
            server = createServer(9999);
            done();
        }).catch(done);
    });

    after(function () {
        server.close();
    });

    it('Should login', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
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

    it('Should find user', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}`)
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
        superagent.post(`localhost:9999/v1/user/${user._id}/friend`)
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
        superagent.post('localhost:9999/v1/auth/login')
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
        superagent.post(`localhost:9999/v1/user/friend/accept`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .send({fid: dbData.userDoc1._id})
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should find user with new friend', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}`)
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
        superagent.post('localhost:9999/v1/auth/login')
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
        superagent.post(`localhost:9999/v1/user/${user3._id}/friend`)
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
        superagent.get(`localhost:9999/v1/user/${user3._id}/friend`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].invitations.length).toEqual(0);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(res.body.data[0].pending.length).toEqual(1);
                expect(Object.keys(res.body.data[0].pending[0]).sort()).toEqual(['avatar', 'username', '_id'].sort());
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should get friends invitation', function (done) {
        superagent.get(`localhost:9999/v1/user/${user2._id}/friend`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].pending.length).toEqual(0);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(res.body.data[0].invitations.length).toEqual(1);
                expect(Object.keys(res.body.data[0].invitations[0]).sort()).toEqual(['avatar', 'username', '_id'].sort());
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should decline friend', function (done) {
        superagent.post(`localhost:9999/v1/user/friend/decline`)
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
        superagent.get(`localhost:9999/v1/user/${user2._id}/friend`)
            .set('Cookie', cookies2)
            .set('Authorization', `Bearer ${token2}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].pending.length).toEqual(0);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(res.body.data[0].invitations.length).toEqual(0);
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should get friends with no pending', function (done) {
        superagent.get(`localhost:9999/v1/user/${user3._id}/friend`)
            .set('Cookie', cookies3)
            .set('Authorization', `Bearer ${token3}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].pending.length).toEqual(0);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(res.body.data[0].invitations.length).toEqual(0);
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should get friends', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}/friend`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].friends.length).toEqual(2);
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should delete friends', function (done) {
        superagent.delete(`localhost:9999/v1/user/${user._id}/friend/${user2._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should get friends without deleted friend', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}/friend`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].friends.length).toEqual(1);
                expect(Object.keys(res.body.data[0].friends[0]).sort()).toEqual(['firstname', 'lastname', 'avatar', 'username', 'salutation', '_id'].sort());
                done();
            });
    });

    it('Should ignore user', function (done) {
        superagent.post(`localhost:9999/v1/user/${user._id}/ignore`)
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
        superagent.get(`localhost:9999/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                expect(res.body.data).toBeAn('array');
                expect(res.body.data.length).toEqual(1);
                expect(res.body.data[0].friends.indexOf(user2._id.toString())).toEqual(-1);
                done();
            });
    });

    it('Should have friend removed', function (done) {
        superagent.get(`localhost:9999/v1/user/${user2._id}`)
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
        superagent.post(`localhost:9999/v1/user/${user2._id}/friend`)
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
        superagent.delete(`localhost:9999/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(200);
                done();
            });
    });

    it('Should not find user', function (done) {
        superagent.get(`localhost:9999/v1/user/${user._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(401);
                done();
            });
    });

    it('Should login as admin', function (done) {
        superagent.post('localhost:9999/v1/auth/login')
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
        superagent.delete(`localhost:9999/v1/user/${dbData.userDoc2._id}`)
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
        superagent.get(`localhost:9999/v1/user/${dbData.userDoc2._id}`)
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${token}`)
            .type('json')
            .end((err, res) => {
                expect(res.status).toEqual(404);
                done();
            });
    });
});