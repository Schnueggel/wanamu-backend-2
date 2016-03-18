/**!
 * kcors - index.js
 *
 * Copyright(c) koajs and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 *   christian.steinmann <christian.steinmann77@gmail.com>
 */

'use strict';

/**
 * CORS middleware
 *
 * @param {Object} [options]
 *  - {String|Function(ctx)} origin `Access-Control-Allow-Origin`, default is request Origin header
 *  - {String|Array} allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE'
 *  - {String|Array} exposeHeaders `Access-Control-Expose-Headers`
 *  - {String|Array} allowHeaders `Access-Control-Allow-Headers`
 *  - {String|Number} maxAge `Access-Control-Max-Age` in seconds
 *  - {Boolean} credentials `Access-Control-Allow-Credentials`
 * @return {Function}
 * @api public
 */
export default function cors (options) {
    var defaults = {
        allowMethods: 'GET,HEAD,PUT,POST,DELETE'
    };

    options = options || {};

    Object.assign(options, defaults, options);

    if (Array.isArray(options.exposeHeaders)) {
        options.exposeHeaders = options.exposeHeaders.join(',');
    }

    if (Array.isArray(options.allowMethods)) {
        options.allowMethods = options.allowMethods.join(',');
    }

    if (Array.isArray(options.allowHeaders)) {
        options.allowHeaders = options.allowHeaders.join(',');
    }

    if (options.maxAge) {
        options.maxAge = String(options.maxAge);
    }

    options.credentials = !!options.credentials;

    return async function cors(ctx, next) {
        // If the Origin header is not present terminate this set of steps. The request is outside the scope of this specification.
        var requestOrigin = ctx.request.get('Origin');
        if (!requestOrigin) {
            return await next();
        }

        var origin;
        if (typeof options.origin === 'function') {
            origin = options.origin(this);
            if (!origin) {
                return await next();
            }
        } else {
            origin = options.origin || requestOrigin;
        }

        if (ctx.request.method !== 'OPTIONS') {
            // Simple Cross-Origin Request, Actual Request, and Redirects

            ctx.response.set('Access-Control-Allow-Origin', origin);

            if (options.credentials === true) {
                ctx.response.set('Access-Control-Allow-Credentials', 'true');
            }

            if (options.exposeHeaders) {
                ctx.response.set('Access-Control-Expose-Headers', options.exposeHeaders);
            }

            await next();
        } else {
            // Preflight Request

            // If there is no Access-Control-Request-Method header or if parsing failed,
            // do not set any additional headers and terminate this set of steps.
            // The request is outside the scope of this specification.
            if (!ctx.request.get('Access-Control-Request-Method')) {
                // this not preflight request, ignore it
                return await next();
            }

            ctx.response.set('Access-Control-Allow-Origin', origin);

            if (options.credentials === true) {
                ctx.response.set('Access-Control-Allow-Credentials', 'true');
            }

            if (options.maxAge) {
                ctx.response.set('Access-Control-Max-Age', options.maxAge);
            }

            if (options.allowMethods) {
                ctx.response.set('Access-Control-Allow-Methods', options.allowMethods);
            }

            var allowHeaders = options.allowHeaders;
            if (!allowHeaders) {
                allowHeaders = ctx.request.get('Access-Control-Request-Headers');
            }
            if (allowHeaders) {
                ctx.response.set('Access-Control-Allow-Headers', allowHeaders);
            }

            ctx.status = 204;
        }
    };
}