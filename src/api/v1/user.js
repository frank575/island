const Router = require('koa-router')
const User = require('../../models/user')
const { RegisterValidator } = require('../../validators/velidators')
const router = new Router({
  // 路由前綴
  prefix: '/v1/user'
})

// 註冊
router.post('/register', async ctx => {
  const v = await new RegisterValidator(ctx).validate()
  const user = {
    username: v.get('body.username'),
    password: v.get('body.password'),
    nickname: v.get('body.nickname'),
  }
  await User.create(user)
})

// 登入
router.post('/login', async ctx => {
  // TODO 驗證帳號是否存在，驗證密碼是否正確(bcrypt.compareSync(pwd, hashPwd))
})

module.exports = router
