const { HttpSuccessResponse } = require('../core/ErrorException')

async function successResponse(cxt, next) {
  const res = await next()
  const method = cxt.method
  const status = method === 'POST'
    ? 201
    : 200
  let message, data
  if (typeof res === 'object') {
    if (res.data != null)
      data = res.data
    if (res.message != null)
      message = res.message
  } else
    data = res

  new HttpSuccessResponse(message, status).getResponse(cxt, data)
}

module.exports = successResponse
