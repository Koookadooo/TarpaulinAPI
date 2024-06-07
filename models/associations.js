const { User } = require('./user');
const { Course } = require('./course');
const { Assignment } = require('./assignment');
const { Submission } = require('./submission');

// User and Course (Instructor)
User.hasMany(Course, { foreignKey: { allowNull: false, name: 'instructorId' } });
Course.belongsTo(User, { foreignKey: 'instructorId' });

// User and Submission (Student)
User.hasMany(Submission, { foreignKey: { allowNull: false, name: 'studentId' } });
Submission.belongsTo(User, { foreignKey: 'studentId' });

// Course and Assignment
Course.hasMany(Assignment, { foreignKey: { allowNull: false, name: 'courseId' } });
Assignment.belongsTo(Course, { foreignKey: 'courseId' });

// Assignment and Submission
Assignment.hasMany(Submission, { foreignKey: { allowNull: false, name: 'assignmentId' } });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });
