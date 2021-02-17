const jwt = require('jsonwebtoken')
const { UnauthorizedException } = require('./ErrorException')

// TODO 權限分級 scope
// TODO middleware 掛載到每個路由下，而不是全局統一掛載
// TODO 路徑移到 middlewares 下
// TODO getter m 改寫
// TODO delete userExpired 要寫成方法調用
class Auth {
  /**
   * 紀錄使用者過期時間
   * @type {[userId: number]: number} {[使用者 id]: 過期時間}
   */
  static userExpired = {}
  static _SECRET = 'island_project_jsonwebtoken_secret'
  static level = {}

  async m(ctx, next) {
    const headers = ctx.request.headers
    const { authorization } = headers

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
      throw new UnauthorizedException('授權失敗')

    const token = authorization.replace('Bearer ', '')
    const decoded = await jwt.verify(token, Auth._SECRET)
    const now = Date.now()
    let exp = Auth.userExpired[decoded.id]
    const isExpired = exp == null ||
      now > exp
    if (isExpired) {
      delete Auth.userExpired[decoded.id]
      throw new UnauthorizedException('授權失敗')
    }
    ctx.decoded = decoded
  }
}

module.exports = Auth
