const jwt = require('jsonwebtoken')
const { HTTPResponse } = require('../core/ErrorException')
const { JWTErrorException } = require('../core/ErrorException')
const { TokenExpiredError } = require('jsonwebtoken')
const { NotBeforeError } = require('jsonwebtoken')
const { JsonWebTokenError } = require('jsonwebtoken')
const { ForbiddenException } = require('../core/ErrorException')

// TODO 權限分級 scope
class Auth {
  /**
   * 紀錄使用者過期時間
   * @type {[userId: number]: number} {[使用者 id]: 過期時間}
   */
  static userExpired = {}
  static _SECRET = 'island_project_jsonwebtoken_secret'
  static level = {}

  /**
   *
   * @param level 權限分級 [number]
   * @returns {function(ctx, next): *}
   */
  static m(level = 99) {
    return async (ctx, next) => {
      const headers = ctx.request.headers
      const { authorization } = headers

      if (authorization == null)
        throw new ForbiddenException('請確認驗證參數是否正確')

      await Auth.getDecoded(ctx, authorization)
      return await next()
    }
  }
  /**
   * 創建 jsonwebtoken
   * @param user 使用者資料 [User]
   * @returns {string} jsonwebtoken
   */
  static createToken(user) {
    const expiresIn = 86400000
    const exp = Date.now() + expiresIn
    const userId = user.id
    Auth.userExpired[userId] = exp
    return jwt.sign({ id: userId }, Auth._SECRET)
  }

  /**
   * 取得使用者資料 where id, token
   * @param ctx
   * @param authorization Bearer ...
   * @returns {Promise<User|null>}
   */
  static async getDecoded(ctx, authorization) {
    if (authorization === '')
      throw new ForbiddenException('授權失敗')

    const token = authorization.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, Auth._SECRET)
      const now = Date.now()
      let exp = Auth.userExpired[decoded.id]
      const isExpired = exp == null ||
        now > exp
      if (isExpired) {
        delete Auth.userExpired[decoded.id]
        throw new ForbiddenException('授權失敗')
      }
      ctx.auth = decoded
    } catch (err) {
      if (err instanceof HTTPResponse)
        throw err
      else if (err instanceof JsonWebTokenError ||
        err instanceof NotBeforeError ||
        err instanceof TokenExpiredError)
        throw new JWTErrorException(err.message)
    }
  }

  static expired(ctx) {
    delete Auth.userExpired[ctx.auth.id]
  }
}

module.exports = Auth
