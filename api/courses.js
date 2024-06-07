const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');

const { requireAuth } = require('../lib/auth');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = process.env.JWT_SECRET;



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
    courses: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  });
});

// Create a new Course

router.post('/', requireAuth, async function (req, res, next) {
  try {
    const course = await Course.create(req.body, CourseClientFields);
    res.status(201).send({ id: course.id });
  }
  catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    }
    else {
      throw e
    }
  }
});

// Fetch data about a specific Course

router.get('/:id', async function (req, res, next) {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);

  if (course) {
    res.status(200).send(course);
  }
  else {
    next();
  }
});

// Update data for a specific Course

router.patch('/:id', requireAuth, async function (req, res, next) {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);

  if (req.user != course.instructorId) {
    res.status(403).json({ "Error": "Unauthorized" });
  }
  const result = await Course.update(req.body, {
    where: { id: courseId },
    fields: CourseClientFields
  });
  if (result[0] > 0) {
    res.status(204).send();
  }
  else {
    next();
  }
});

// Remove a specific Course from the database

router.delete('/:id', requireAuth, async function (req, res, next) {
  const courseId = req.params.id;

  if (req.user.role != "admin") {
    res.status(403).json({ "Error": "Unauthorized" });
  }
  const result = await Course.destroy({ where: { id: courseId }});
  if (result > 0) {
    res.status(204).send();
  }
  else {
    next();
  }
});

// Fetch a list of the students enrolled in a course

router.get('/:id/students', requireAuth, async function (req, res, next) {
  res.json({ message: `GET /courses/${req.params.id}/students` });
});

// Update enrollment for a Course

router.post('/:id/students', requireAuth, async function (req, res, next) {
  res.json({ message: `POST /courses/${req.params.id}/students` });
});

// Fetch a CSV file containing list of the students enrolled in the Course

router.get('/:id/roster', requireAuth, async function (req, res, next) {
  res.json({ message: `GET /courses/${req.params.id}/roster` });
});

// Fetch a list of the Assignments for the Course

router.get('/:id/assignments', requireAuth, async function (req, res, next) {
  res.json({ message: `GET /courses/${req.params.id}/assignments` });
});

module.exports = router;