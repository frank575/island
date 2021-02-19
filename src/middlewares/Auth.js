const jwt = require('jsonwebtoken')
const { HTTPResponse } = require('../core/ErrorException')
const { JWTErrorException } = require('../core/ErrorException')
const { TokenExpiredError } = require('jsonwebtoken')
const { NotBeforeError } = require('jsonwebtoken')
const { JsonWebTokenError } = require('jsonwebtoken')
const { ForbiddenException } = require('../core/ErrorException')

// TODO 整理目錄
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
   * @param level? 權限分級(空為不分級) [number]
   * @returns {function(ctx, next): *}
   */
  static m(level) {
    return async (ctx, next) => {
      const headers = ctx.request.headers
      const { authorization } = headers

      if (authorization == null)
        throw new ForbiddenException('請確認驗證參數是否正確')

      const decoded = await Auth.getDecoded(authorization)
      if (level != null &&
        decoded.scope < level)
        throw new ForbiddenException('權限不足')
      ctx.auth = decoded

      return await next()
    }
  }

  /**
   * 創建 jsonwebtoken
   * @param user 使用者資料 [User]
   * @returns {string} jsonwebtoken payload { id: user.id, scope: 權限分級 }
   */
  static createToken(user) {
    const expiresIn = 86400000
    const exp = Date.now() + expiresIn
    const userId = user.id
    Auth.userExpired[userId] = exp
    return jwt.sign({ id: userId, scope: 1 }, Auth._SECRET, {
      expiresIn
    })
  }

  /**
   * 取得使用者資料 where id, token
   * @param authorization Bearer ...
   * @returns {Promise<User|null>}
   */
  static async getDecoded(authorization) {
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
      return decoded
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
