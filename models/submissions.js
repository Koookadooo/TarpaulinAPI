const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const { User } = require('./users');
const { Assignment } = require('./assignments');

const Submission = sequelize.define('submission', {
    assignmentId: { type: DataTypes.INTEGER, allowNull: false },
    studnetId: { type: DataTypes.INTEGER, allowNull: false },
    timestamp: { type: DataTypes.DATE, allowNull: false },
    grade: { type: DataTypes.FLOAT, allowNull: true },
    file : { type: DataTypes.STRING, allowNull: false }
});

/*
 * Set up many-to-one relationship between Submission and User.
 */

Submission.belongsTo(User);
User.hasMany(Submission, { foreignKey: { allowNull: false } });

/*
 * Set up one-to-one relationship between Submission and Assignment.
 */
Submission.belongsTo(Assignment);
Assignment.hasOne(Submission);

exports.Submission = Submission;

exports.SubmissionClientFields = [
    'assignmentId',
    'studentId',
    'timestamp',
    'grade',
    'file'
];
