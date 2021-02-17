const jwt = require('jsonwebtoken')
const config = require('../config/config')
const { UnauthorizedException } = require('./ErrorException')

class Auth {
  static async authorize(ctx, next) {
    const headers = ctx.request.headers
    const { authorization } = headers
    const passList = config.pass
    const path = ctx.path
    const pass = passList.some(e => path.indexOf(e) !== -1)

    if (pass === true)
      return await next()

    if (authorization == null)
      throw new UnauthorizedException('請確認驗證參數是否正確')

    await Auth.getDecoded(ctx, authorization)
    await next()
  }

  /**
   * 創建 jsonwebtoken
   * @param user 使用者資料 [User]
   * @returns {string} jsonwebtoken
   */
  static createToken(user) {
    const expiresIn = 86400000
    const exp = Date.now() + expiresIn
    // 建立 token
    return jwt.sign({ _id: user.id, exp }, 'island_project_jsonwebtoken_secret')
  }

  /**
   * 取得使用者資料 where id, token
   * @param ctx
   * @param authorization Bearer ...
   * @returns {Promise<User|null>}
   */
  static async getDecoded(ctx, authorization) {
    const token = authorization.replace('Bearer ', '')
    const decoded = await jwt.verify(token, 'island_project_jsonwebtoken_secret')
    const now = Date.now()
    const isExpired = decoded.exp != null &&
      now > decoded.exp
    if (isExpired)
      throw new UnauthorizedException('授權已過期')
    ctx.decoded = decoded
    return decoded
  }
}

module.exports = Auth
