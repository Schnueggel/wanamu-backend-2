'use strict';

import Koa from 'koa';
import mount from 'koa-mount';
import rewrite from 'koa-rewrite';
import http from 'http';

import v1 from './v1/v1.js';
import config from './v1/config';
import log from './v1/config/log';

const app = new Koa(),
    port = config.WU_PORT;

//Rewrite all request without version to the default version
app.use(rewrite(/^\/([^v\d].+)/, '/v1/$1'));

const server = http.createServer();
//Mount each version as independent app
app.use(mount(v1.create(server)));
// On every request run the koa app callback
server.on('request', app.callback());

server.listen(port, '0.0.0.0', () => {
    log.info('Wanamu backend 2 worker started at port ' + port);
});
