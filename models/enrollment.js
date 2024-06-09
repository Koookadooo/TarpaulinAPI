const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');
const { User } = require('./user');
const { Course } = require('./course');

const Enrollment = sequelize.define('enrollment', {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id'
    },
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    primaryKey: true
  }
});

exports.Enrollment = Enrollment;
