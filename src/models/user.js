const bcrypt = require('bcryptjs')
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../core/db')
const Auth = require('../middlewares/Auth')
const { UserLoginFailException } = require('../core/ErrorException')

class User extends Model {
  /**
   * 登入驗證
   * @param username
   * @param password
   * @returns {Promise<{ user: User, token: string }>}
   */
  static async verifyLogin(username, password) {
    const user = await User.findOne({
      where: {
        username
      }
    })
    let token
    if (user != null) {
      const checkPassword = await bcrypt.compare(password, user.password)
      if (!checkPassword) throw new UserLoginFailException()
      token = Auth.createToken(user)
    } else throw new UserLoginFailException()
    return {
      user,
      token,
    }
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
