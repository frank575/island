const Router = require('koa-router')
const { KoaValidator } = require('../../core/KoaValidator')
const router = new Router()

router.get('/v1/book/:id', async ctx => {
  const v = await new class extends KoaValidator {
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
