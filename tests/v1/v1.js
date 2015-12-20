'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setUp } from '../../dist/v1/tools/setup';
import app from '../../dist/v1/v1';

describe ('App Running', function() {
    let server;

    before(function(done) {
        setUp().then(() => {
            server = app.listen(9999, '127.0.0.1', done);
        }).catch(done);
    });

    after(function() {
        server.close();
    });

    it('Should run test', function(done){
        superagent.get('localhost:9999/v1/test').end((err, res) => {
            expect(res).toBeAn('object');
            expect(res.status).toEqual(200);
            done();
        });
    });
});