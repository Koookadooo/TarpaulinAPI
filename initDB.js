const sequelize = require('./lib/sequelize');
const bcrypt = require('bcrypt');
const { User, UserClientFields } = require('./models/user');
const { Course, CourseClientFields } = require('./models/course');
const { Assignment, AssignmentClientFields } = require('./models/assignment');
const { Submission, SubmissionClientFields } = require('./models/submission');
const { Enrollment } = require('./models/enrollment');
require('./models/associations');

const userData = require('./data/users.json');
const courseData = require('./data/courses.json');
const assignmentData = require('./data/assignments.json');
const submissionData = require('./data/submissions.json');
const enrollmentData = require('./data/enrollments.json');

async function hashPasswords(userData) {
  for (const user of userData) {
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(user.password, salt);
  }
}

sequelize.sync({ force: true }).then(async function () {
  try {
    await hashPasswords(userData);

    await User.bulkCreate(userData, { fields: UserClientFields });
    await Course.bulkCreate(courseData, { fields: CourseClientFields });
    await Assignment.bulkCreate(assignmentData, { fields: AssignmentClientFields });
    await Submission.bulkCreate(submissionData, { fields: SubmissionClientFields });
    await Enrollment.bulkCreate(enrollmentData);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database: ", error);
  }
});