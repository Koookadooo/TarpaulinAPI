const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const Course = sequelize.define('course', {
  id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false },
  instructorId: { type: DataTypes.INTEGER, allowNull: false },
  studentIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
});

exports.Course = Course;

exports.CourseClientFields = [
  'subject',
  'number',
  'title',
  'term',
  'instructorId',
  'studentIds'
];
