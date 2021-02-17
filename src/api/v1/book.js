const Router = require('koa-router')
const router = new Router()

router.get('/v1/book/:id', async ctx => {
  return 'book'
})

module.exports = router
