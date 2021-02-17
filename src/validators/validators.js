const User = require('../models/user')
const { WeiValidator } = require('../core/WeiValidator')

const passwordRules = r => [
  r('required', { min: 8, max: 32 }),
  r(v => /^(?![0-9]+$)(?![A-z]+$)[0-9A-z]/.test(v), '密碼格式不符合規範')
]

class RegisterValidator extends WeiValidator {
  constructor (ctx) {
    super(ctx)
    this.createRules(r => ({
      'body.username': [
        // r('email'),
        r('required', { min: 6, max: 20 }),
        r('unique', { model: User, key: 'username' }),
      ],
      'body.nickname': r('required', { min: 3, max: 64 }),
      'body.password': passwordRules(r),
      'body.password2': passwordRules(r)
        .concat([
          r(v => v === this.get('body.password', false), '二次密碼輸入值必須相同')
        ]),
    }))
    // this.createRules(r => ({
    //   body: {
    //     username: [
    //       // r('email'),
    //       r('required', { min: 6, max: 20 }),
    //       r('unique', { model: User, key: 'username' }),
    //     ],
    //     nickname: r('required', { min: 3, max: 64 }),
    //     password: passwordRules(r),
    //     password2: passwordRules(r)
    //       .concat([
    //         r(v => v === this.get('body.password', false), '二次密碼輸入值必須相同')
    //       ]),
    //   },
    // }))
  }
}

class LoginValidator extends WeiValidator {
  constructor (ctx) {
    super(ctx)
    // this.createRules(r => ({
    //   'body.username': r('required', { min: 6, max: 20 }),
    //   'body.password': [
    //     r('required', { min: 8, max: 32 }),
    //     r(v => /^(?![0-9]+$)(?![A-z]+$)[0-9A-z]/.test(v), '密碼格式不符合規範')
    //   ],
    // }))
    this.createRules(r => ({
      body: {
        username: r('required', { min: 6, max: 20 }),
        password: [
          r('required', { min: 8, max: 32 }),
          r(v => /^(?![0-9]+$)(?![A-z]+$)[0-9A-z]/.test(v), '密碼格式不符合規範')
        ],
      },
    }))
  }
}

module.exports = {
  RegisterValidator,
  LoginValidator,
}
