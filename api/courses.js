const express = require('express');
const router = express.Router();
const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');
const { Assignment } = require('../models/assignment');
const { Enrollment } = require('../models/enrollment');
const { User } = require('../models/user');
const { Parser } = require('json2csv');
const { requireAuth, requireRole } = require('../lib/auth');

// Fetch the list of all Courses

router.get('/', async function (req, res) {

  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Course.findAndCountAll({
    limit: numPerPage,
    offset: offset
  });

  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/courses?page=${page + 1}`
    links.lastPage = `/courses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/courses?page=${page - 1}`
    links.firstPage = '/courses?page=1'
  }

  res.status(200).json({
    message: "SUCCESS",
    courses: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  });
});

// Create a new Course

router.post('/', requireAuth, requireRole('admin'), async function (req, res, next) {
  try {
    const { subject, number, term } = req.body;

    const user = await User.findByPk(req.user.id);
    if (user.role != "admin" ) {
      return res.status(403).send({ error: "Forbidden: Admin access required" });
    }

    const existingCourse = await Course.findOne({ where: { subject, number, term } });
    if (existingCourse) {
      return res.status(400).send({ error: "FAILURE: Course already exists" });
    }

    const course = await Course.create(req.body, CourseClientFields);
    res.status(201).send({ message: "SUCCESS: Course created", id: course.id });
  }
  catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: "FAILURE: " + e.message });
    }
    else {
      throw e;
    }
  }
});

// Fetch data about a specific Course

router.get('/:id', async function (req, res, next) {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);

  if (course) {
    res.status(200).send({ message: "SUCCESS: Course found", course });
  }
  else {
    res.status(404).send({ error: "FAILURE: Course not found" });
  }
});

// Update data for a specific Course

router.patch('/:id', requireAuth, requireRole('admin', 'instructor'), async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    const user = await User.findByPk(req.user.id);
    if (user.role != "admin" && user.id != course.instructorId) {
      return res.status(403).send({ error: "Forbidden: Admin or course instructor access required" });
    }

    const result = await Course.update(req.body, {
      where: { id: courseId },
      fields: CourseClientFields
    });

    if (result[0] > 0) {
      res.status(204).send({ message: "SUCCESS: Course successfully updated" });
    }
    else {
      res.status(404).send({ error: "FAILURE: Course not found" });
    }
  }
  catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: "FAILURE: " + e.message });
    }
    else {
      throw e;
    }
  }
});

// Remove a specific Course from the database

router.delete('/:id', requireAuth, requireRole('admin'), async function (req, res, next) {
  try {
    const courseId = req.params.id;

    const user = await User.findByPk(req.user.id);
    if (user.role != "admin") {
      return res.status(403).send({ error: "Forbidden: Admin access required" });
    }

    const result = await Course.destroy({ where: { id: courseId }});
    if (result > 0) {
      res.status(204).send({ message: "SUCCESS: Course successfully deleted" });
    }
    else {
      res.status(404).send({ error: "FAILURE: Course not found" });
    }
  }
  catch (e) {
    res.status(400).send({ error: "FAILURE: " + e.message });
  }
});

// Fetch a list of the students enrolled in a course

router.get('/:id/students', requireAuth, requireRole('admin', 'instructor'), async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'FAILURE: Course not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: {
        model: User,
        attributes: ['id', 'name', 'email'],
        where: { role: 'student' }
      }
    });
    
    res.status(200).json({ message: "SUCCESS: Students found", students: enrollments.map(enrollment => enrollment.user) });
  } catch (err) {
    console.error("Error fetching students:", err);
    next(err);
  }
});

// Update enrollment for a Course

router.post('/:id/students', requireAuth, requireRole('admin', 'instructor'), async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const { add, remove } = req.body;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'FAILURE: Course not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    if (add && add.length > 0) {
      for (const studentId of add) {
        const student = await User.findOne({ where: { id: studentId, role: 'student' } });
        if (student) {
          await Enrollment.findOrCreate({ where: { courseId, studentId: student.id } });
        }
      }
    }
    
    if (remove && remove.length > 0) {
      await Enrollment.destroy({
        where: {
          courseId,
          studentId: remove
        }
      });
    }

    res.status(200).json({ message: 'SUCCESS: Enrollment updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// Fetch a CSV file containing list of the students enrolled in the Course

router.get('/:id/roster', requireAuth, requireRole('admin', 'instructor'), async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    // Handle case where course is not found
    if (!course) {
      console.log(`Course not found: courseId=${courseId}`);
      return res.status(404).json({ error: 'FAILURE: Course not found' });
    }

    const user = await User.findByPk(req.user.id);

    // Check if the user is the instructor of the course or admin
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      console.log(`Permission denied: userId=${user.id}, role=${user.role}, courseId=${courseId}`);
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const enrollments = await Enrollment.findAll({ where: { courseId }, include: { model: User, attributes: ['id', 'name', 'email'] } });
    const students = enrollments.map(enrollment => enrollment.user);
    const fields = ['id', 'name', 'email'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment(`course_${courseId}_roster.csv`);
    res.send(csv);
  } catch (err) {
    console.error(`Error processing request: ${err.message}`);
    next(err);
  }
});

// Fetch a list of the Assignments for the Course

router.get('/:id/assignments', requireAuth, requireRole('admin', 'instructor'), async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'FAILURE: Course not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Fetch the assignments for the course
    const assignments = await Assignment.findAll({ where: { courseId } });
    res.status(200).json({ message: "SUCCESS: Assignments found", assignments: assignments.map(assignment => assignment.id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
