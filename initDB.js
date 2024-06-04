const sequelize = require('./lib/sequelize');
const bcrypt = require('bcrypt');
const { User, UserClientFields } = require('./models/user');
const { Course, CourseClientFields } = require('./models/course');
const { Assignment, AssignmentClientFields } = require('./models/assignment');
const { Submission, SubmissionClientFields } = require('./models/submission');
require('./models/associations');

// Load the initial data
const userData = require('./data/users.json');
const courseData = require('./data/courses.json');
const assignmentData = require('./data/assignments.json');
const submissionData = require('./data/submissions.json');

// Function to hash user passwords
async function hashPasswords(userData) {
  for (const user of userData) {
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(user.password, salt);
  }
}

// Function to delete existing data
async function clearTables() {
  await User.destroy({ where: {}, truncate: true });
  await Course.destroy({ where: {}, truncate: true });
  await Assignment.destroy({ where: {}, truncate: true });
  await Submission.destroy({ where: {}, truncate: true });
}

// Synchronize the database and populate it with initial data
sequelize.sync({ force: true }).then(async function () {
  try {
    // Preprocess the user data to hash passwords
    await hashPasswords(userData);

    // Clear existing data
    await clearTables();

    // Insert new data into the database
    await User.bulkCreate(userData, { fields: UserClientFields });
    await Course.bulkCreate(courseData, { fields: CourseClientFields });
    await Assignment.bulkCreate(assignmentData, { fields: AssignmentClientFields });
    await Submission.bulkCreate(submissionData, { fields: SubmissionClientFields });

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database: ", error);
  }
});
