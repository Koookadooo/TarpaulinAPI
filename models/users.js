const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const { Submission } = require('./submissions');
const { Course } = require('./courses');
const { Assignment } = require('./assignments');

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false }
});

/*
 * Set up a many-to-many relationship between User and Course.
 */
User.hasMany(Course, { foreignKey: { allowNull: false } });
Course.belongsToMany(User);

/*
 * Set up a many-to-many relationship between User and Assignment.
 */
User.hasMany(Assignment, { foreignKey: { allowNull: false } });
Assignment.belongsToMany(User);

/*
 * Set up a many-to-many relationship between User and Submission.
 */
User.hasMany(Submission, { foreignKey: { allowNull: false } });
Submission.belongsToMany(User);

exports.User = User;

exports.UserClientFields = [
    'name',
    'email',
    'password',
    'role'
];

