const { HttpSuccessResponse } = require('../core/ErrorException')

async function successResponse(ctx, next) {
  const res = await next()
  const method = ctx.method
  const status = method === 'POST'
    ? 201
    : 200
  if (typeof res === 'function')
    res(status)
  else
    new HttpSuccessResponse('ok', status).getResponse(ctx, res)
}

module.exports = successResponse
