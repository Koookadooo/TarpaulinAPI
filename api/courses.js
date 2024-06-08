const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');
const { User, UserClientFields } = require('../models/user');

const { requireAuth } = require('../lib/auth');

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

router.post('/', async function (req, res, next) {
  try {
    const { subject, number, term } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send({ Error: "Missing authorization header" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secret_key);
      if (!decoded.role == "admin" ) {
        return res.status(403).send({ Error: "Admin access required" });
      }
    }
    catch (e) {
      return res.status(401).send({ Error: "Invalid token" });
    }

    const existingCourse = await Course.findOne({ where: { subject, number, term } });
    if (existingCourse) {
      return res.status(400).send({ Error: "Course already exists" });
    }

    const course = await Course.create(req.body, CourseClientFields);
    res.status(201).send({ id: course.id });
  }
  catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
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
    res.status(200).send(course);
  }
  else {
    next();
  }
});

// Update data for a specific Course

router.patch('/:id', async function (req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send({ Error: "Missing authorization header" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secret_key);
      if (!decoded.role == "admin" && decoded.id != course.instructorId ) {
        return res.status(403).send({ Error: "Admin or instructor access required" });
      }
    }
    catch (e) {
      return res.status(401).send({ Error: "Invalid token" });
    }

    const result = await Course.update(req.body, {
      where: { id: courseId },
      fields: CourseClientFields
    });

    if (result[0] > 0) {
      res.status(204).send({ message: "Course successfully updated" });
    }
    else {
      next();
    }
  }
  catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    }
    else {
      throw e;
    }
  }
});

// Remove a specific Course from the database

router.delete('/:id', async function (req, res, next) {
  try {
    const courseId = req.params.id;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ Error: "Missing authorization header" });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secret_key);
      if (!decoded.role == "admin") {
        return res.status(403).send({ Error: "Admin access required" });
      }
    }
    catch (err) {
      return res.status(401).send({ Error: "Invalid token" });
    }

    const result = await Course.destroy({ where: { id: courseId }});
    if (result > 0) {
      return res.status(204).send({ message: "Course successfully deleted" });
    }
    else {
      next();
    }
  }
  catch (e) {
    res.status(400).send({ Error: e.message });
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