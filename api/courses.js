const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');

const requireAuth = require('../lib/auth');

// Placeholder Route to ensure server is working
router.get('/', (req, res) => {
  res.json({ message: 'Courses route placeholder' });
});

router.post('/', (req, res, next) => {
  res.json({ message: "POST /courses" })
});

router.get('/:id', (req, res, next) => {
  res.json({ message: `GET /courses/${req.params.id}` })
});

router.patch('/:id', (req, res, next) => {
  res.json({ message: `PATCH /courses/${req.params.id}` })
});

router.delete('/:id', (req, res, next) => {
  res.json({ message: `DELETE /courses/${req.params.id}` })
});

module.exports = router;