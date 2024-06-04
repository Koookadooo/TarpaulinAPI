const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'instructor', 'student'), allowNull: false, defaultValue: 'student' }
});

exports.User = User;

exports.UserClientFields = [
  'name',
  'email',
  'password',
  'role'
];