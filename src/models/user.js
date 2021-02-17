const bcrypt = require('bcryptjs')
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../core/db')
const { UserLoginFailException } = require('../core/ErrorException')

class User extends Model {
  static async verifyLogin(username, password) {
    const user = await User.findOne({
      where: {
        username
      }
    })
    if (user != null) {
      const checkPassword = bcrypt.compareSync(password, user.password)
      if (!checkPassword) throw new UserLoginFailException()
    } else throw new UserLoginFailException()
  }
}
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nickname: DataTypes.STRING(128),
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    set(val) {
      const salt = bcrypt.genSaltSync(10)
      const password = bcrypt.hashSync(val, salt)
      this.setDataValue('password', password)
    }
  },
}, { sequelize, tableName: 'user' })

module.exports = User
