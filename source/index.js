'use strict';

import Koa from 'koa';
import mount from 'koa-mount';
import rewrite from 'koa-rewrite';

//Import all versions
import v1 from './v1/v1.js';

const app  = new Koa(),
    port = process.env.WU_PORT || 1337;

//Rewrite all request without version to the default version
app.use(rewrite(/^\/([^v\d].+)/, '/v1/$1'));

//Mount each version as independent app
app.use(mount(v1()));

app.server = app.listen(port, '0.0.0.0', () => {
    console.info('Koa started at port ' + port);
});

export default app;