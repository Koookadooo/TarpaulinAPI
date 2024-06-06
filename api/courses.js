const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');

const { requireAuth } = require('../lib/auth');

// Return a list of courses

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

module.exports = router;