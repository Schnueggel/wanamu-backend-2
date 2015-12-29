'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb, createServer } from '../../dist/v1/tools/setup';

describe ('App Running', function() {
    let server;

    before(function(done) {
        setupDb().then(() => {
            server = createServer(9999);
            done();
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