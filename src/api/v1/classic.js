const Router = require('koa-router')
const router = new Router()

router.get('/v1/classic/latest', async (ctx, next) => {
  ctx.body = 'classic'
})

module.exports = router
