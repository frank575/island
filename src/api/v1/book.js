const Router = require('koa-router')
const router = new Router()
const { BookValidator } = require('../../validators/validators')
const { ErrorException } = require('../../core/ErrorException')

router.get('/v1/book/:id', async ctx => {
  const v = new BookValidator(ctx)
  const aaa = v.get('query.name', false)
  await v.validate()
  ctx.body = {
    id: v.get('params.id'),
    name: aaa,
  }
})

module.exports = router
