const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const { Course } = require('./courses');
const { User } = require('./users');

const Assignment = sequelize.define('assignment', {
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    due: { type: DataTypes.DATE, allowNull: false }
});

/*
 * Set up many-to-many relationship between Assignment and User.
 */
Assignment.hasMany(User, { foreignKey: { allowNull: false } });
Assignment.belongsTo(Course);

/*
 * Set up and assignment to have one submission.
 */
Assignment.hasOne(Submission);
Submission.belongsTo(Assignment);

exports.Assignment = Assignment;

exports.AssignmentClientFields = [
    'courseId',
    'points',
    'due'
];

