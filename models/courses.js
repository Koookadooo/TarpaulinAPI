const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const { User } = require('./users');
const { Assignment } = require('./assignments');

const Course = sequelize.define('course', {
    subject: { type: DataTypes.STRING, allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    term: { type: DataTypes.STRING, allowNull: false },
    instructorId: { type: DataTypes.INTEGER, allowNull: false }
});

/*
 * Set up many-to-many relationship between Course and User.
 */
Course.hasMany(User, { foreignKey: { allowNull: false } });
User.belongsToMany(Course);

/*
 * Set up one-to-many relationship between Course and Assignment.
 */
Course.hasMany(Assignment, { foreignKey: { allowNull: false } });
Assignment.belongsTo(Course);

exports.Course = Course;

exports.CourseClientFields = [
    'subject',
    'number',
    'title',
    'term',
    'instructorId'
];
