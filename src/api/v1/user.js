const Router = require('koa-router')
const User = require('../../models/user')
const { UserNotFoundException } = require('../../core/ErrorException')
const { LoginValidator } = require('../../validators/validators')
const { RegisterValidator } = require('../../validators/validators')
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
  const v = await new LoginValidator(ctx).validate()
  return (await User.verifyLogin(v.get('body.username'), v.get('body.password'))).token
})

// 登出
router.post('/logout', async ctx => {
})

// 取得使用者資料
router.get('/info', async ctx => {
  const user = await User.findOne({
    where: {
      id: ctx.decoded._id,
    }
  })
  if (user == null)
    throw new UserNotFoundException()
  return {
    id: user.id,
    nickname: user.nickname,
  }
})

module.exports = router
