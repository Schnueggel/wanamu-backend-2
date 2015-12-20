'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';

describe('App Todolist', function () {
    let server,
        id;

    before(function (done) {
        setUp().then( () => {
            server = app.listen(9999, '127.0.0.1', done);
        }).catch(done);
    });

    after(function () {
        server.close();
    });

    it('Should get todolist', function (done) {
        superagent.get('localhost:9999/v1/todolist/' + id)
            .type('json')
            .end((err, res) => {
                expect(res).toBeAn('object');
                expect(res.status).toEqual(200);
                expect(res.body).toBeAn('object');
                expect(res.body.data).toBeAn('object');
                expect(res.body.data._id).toBeA('string');
                expect(res.body.name).toEqual('todolist');
                done();
            });
    });
});