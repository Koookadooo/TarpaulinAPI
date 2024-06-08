const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { requireAuth, generateAuthToken, requireRole } = require('../lib/auth');
const { User, UserClientFields } = require('../models/user');
const { Course } = require('../models/course');
const { Enrollment } = require('../models/enrollment');
const { ValidationError } = require('sequelize');

/*
 * Route to create a new user.
 */
router.post('/', async function (req, res, next) {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      ...req.body,
      password: passwordHash
    }, { fields: UserClientFields });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      next(err);
    }
  }
});


/*
 * Route to login a user.
 */
router.post('/login', async function (req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email }});
    if (user) {
      const authenticated = await bcrypt.compare(req.body.password, user.password);
      if (authenticated) {
        const token = generateAuthToken(user.id);
        res.status(200).json({ "token": token });
      } else {
        res.status(401).json({ error: 'Invalid login' });
      }
    } else {
      res.status(401).json({ error: 'Invalid login' });
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to fetch data for a specific user.
 */
router.get('/:id', requireAuth, async function (req, res, next) {
  try {
    const userId = req.params.id;
    console.log(`Authenticated user ID: ${req.user.id}, Requested user ID: ${userId}`);
    if (req.user.id != userId) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    const user = await User.findByPk(userId);
    if (user) {
      const response = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      if (user.role === 'instructor') {
        const courses = await Course.findAll({ where: { instructorId: user.id }, attributes: ['id'] });
        response.courses = courses.map(course => course.id);
      } else if (user.role === 'student') {
        const enrollments = await Enrollment.findAll({ where: { studentId: user.id }, attributes: ['courseId'] });
        response.courses = enrollments.map(enrollment => enrollment.courseId);
      }
      res.status(200).json(response);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
