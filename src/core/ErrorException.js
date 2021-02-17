/*
200 查詢成功
201 新增成功
 */
class ErrorException extends Error {
  constructor (message,
    errorCode,
    status) {
    super()
    this.setMembers(message, errorCode, status)
  }

  setMembers (message,
    errorCode,
    status) {
    this.message = message || ''
    this.errorCode = errorCode != null ? errorCode : 10000
    this.status = status || 400
  }

  getResponse (ctx, data) {
    ctx.body = {
      data: data == null ? null : data,
      message: this.message,
      errorCode: this.errorCode,
      request: `[${ctx.method}] ${ctx.path}`
    }
    ctx.status = this.status
  }
}

class InternalServerErrorException extends ErrorException {
  constructor () {
    super()
    this.setMembers('伺服器內部錯誤',
      10000,
      500)
  }
}

class NotFoundException extends ErrorException {
  constructor () {
    super()
    this.setMembers('資源未找到',
      10000,
      404)
  }
}

class ParameterErrorException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || '傳遞的參數錯誤',
      10000)
  }
}

class ValidatorErrorException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || '校驗器錯誤',
      10000)
  }
}

class HttpSuccessResponse extends ErrorException {
  constructor (message, status) {
    super()
    this.setMembers(message || 'ok',
      0,
      status || 200)
  }
}

class UserLoginFailException extends ErrorException {
  constructor () {
    super()
    this.setMembers('帳號或密碼錯誤',
      10000)
  }
}

class JWTErrorException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || 'jwt error',
      10000,
      401)
  }
}

class UnauthorizedException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || '授權失敗',
      10000,
      401)
  }
}

class UserNotFoundException extends ErrorException {
  constructor () {
    super()
    this.setMembers('找不到使用者',
      10000)
  }
}

module.exports = {
  ErrorException,
  JWTErrorException,
  InternalServerErrorException,
  NotFoundException,
  ParameterErrorException,
  ValidatorErrorException,
  HttpSuccessResponse,
  UserLoginFailException,
  UnauthorizedException,
  UserNotFoundException,
}
