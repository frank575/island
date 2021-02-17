const config = require('../config/config')
const { Sequelize } = require('sequelize')
const {
  dbname,
  host,
  port,
  username,
  password,
} = config.db
const sequelize = new Sequelize(dbname, username, password, {
  dialect: 'mysql',
  host,
  port,
  logging: true,
  timezone: '+08:00',
  define: {
    // 不生成 createAt, updateAt [Boolean = true]
    timestamps: true,
    // 生成 deletedAt
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    // 將駝峰轉下滑線 [Boolean = false]
    underscored: true,
  },
})
// 自動創建模型
sequelize.sync({
  // 自動刪表重建 (production 要注意，不然資料會遺失)
  // force: config.env === 'dev',
})

module.exports = sequelize
