export default async (ctx, next) => {
    if (/[0-9]+/.test(ctx.request.query.page) === false) {
        ctx.request.query.page = 1;
    } else {
        ctx.request.query.page = Number(ctx.request.query.page);
    }

    if (/[0-9]+/.test(ctx.request.query.limit) === false) {
        ctx.request.query.limit = 100;
    } else {
        ctx.request.query.limit = Number(ctx.request.query.limit);
    }

    await next();
};