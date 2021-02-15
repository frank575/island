const { Model, DataTypes } = require('sequelize')
const sequelize = require('../core/db')

class User extends Model {}
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nickname: DataTypes.STRING(64),
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
}, { sequelize, tableName: 'user' })
