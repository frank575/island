class ErrorException extends Error {
  constructor (message,
    errorCode,
    status) {
    super()
    this.setMembers(message, errorCode, status)
  }
  setMembers(message,
    errorCode,
    status) {
    this.message = message || ''
    this.errorCode = errorCode || 10000
    this.status = status || 400
  }
  getResponse(ctx) {
    ctx.body = {
      message: this.message,
      errorCode: this.errorCode,
      request: `[${ctx.method}] ${ctx.path}`
    }
    ctx.status = this.status
  }
}

class IntervalServerErrorException extends ErrorException {
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

class ParamsErrorException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || '傳遞的參數錯誤',
      10000,
      400)
  }
}

class ValidatorErrorException extends ErrorException {
  constructor (message) {
    super()
    this.setMembers(message || '較驗器錯誤',
      10000,
      400)
  }
}

module.exports = {
  ErrorException,
  IntervalServerErrorException,
  NotFoundException,
  ParamsErrorException,
  ValidatorErrorException,
}
