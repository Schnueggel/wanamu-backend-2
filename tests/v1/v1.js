'use strict';
import superagent from 'superagent';
import expect from 'expect';
import { setupDb } from '../../dist/v1/tools/setup';

describe ('App Running', function() {

    before(function(done) {
        setupDb().then(() => {
            done();
        }).catch(done);
    });

    it('Should run test', function(done){
        superagent.get('localhost:9999/v1/test').end((err, res) => {
            expect(res).toBeAn('object');
            expect(res.status).toEqual(200);
            done();
        });
    });
});