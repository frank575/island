const Router = require('koa-router')
const { KoaValidator55 } = require('../../core/KoaValidator55')
const router = new Router()

router.get('/v1/book/:id', async ctx => {
  const v = await new class extends KoaValidator55 {
    constructor (ctx) {
      super(ctx)
      this.createRules(r => ({
        query: {
          t: r('boolean')
        },
        params: {
          id: r('int', {min: 10})
        }
      }))
    }
  }(ctx).validate()
  // return 'book'
})

module.exports = router
