const Koa = require('koa')
const Router = require('koa-router')
const parser = require('koa-bodyparser')
const requireDirectory = require('require-directory')
const catchError = require(`../middlewares/exception`)
const $config = require('../config/config')
const successResponse = require('../middlewares/successResponse')

class InitManager {
  static initCore(){
    const app = new Koa()
    InitManager.app = app
    global.$config = $config

    app.use(parser())
    app.use(catchError)
    app.use(successResponse)
    InitManager.initLoadRouters()

    app.listen( 3003)
  }

  static initLoadRouters() {
    // process.cwd() 為獲取目錄跟路徑
    const rootPath = process.cwd()
    requireDirectory(module, `${rootPath}/src/api`, {visit: whenLoadModule})

    function whenLoadModule(obj) {
      if (obj instanceof Router) InitManager.app.use(obj.routes())
    }
  }
}

module.exports = InitManager
