const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const Enrollment = sequelize.define('enrollment', {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    primaryKey: true
  }
});

exports.Enrollment = Enrollment;
