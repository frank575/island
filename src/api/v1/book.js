const Router = require('koa-router')
const { BookValidator } = require('../../validators')
const { ErrorException } = require('../../core/ErrorException')
const router = new Router()

router.get('/v1/book/:id', async (ctx, next) => {
  const v = new BookValidator(ctx)
  v.validate()
  ctx.body = {
    id: v.get('params.id'),
    name: v.get('query.name', false),
  }
})

module.exports = router
