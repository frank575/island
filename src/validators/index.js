const { WeiValidator } = require('../core/WeiValidator')

class BookValidator extends WeiValidator {
  constructor (ctx) {
    super(ctx);
    this.createRules(r => ({
      'params.id': r('int', { min: 1 }),
      'query.name': r('required', { len: [1, 5] })
    }))
  }
}

module.exports = {
  BookValidator,
}
