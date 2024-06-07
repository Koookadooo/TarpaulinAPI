const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { requireAuth, generateAuthToken, requireRole } = require('../lib/auth');
const { User, UserClientFields } = require('../models/user');
const { ValidationError } = require('sequelize');

/*
 * Route to create a new user.
 */
router.post('/users', async function (req, res, next) {
  try {
    const user = await User.create(req.body, { fields: UserClientFields });
    res.status(201).json(user);
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

router.post('/users/login', async function (req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email }});
    if (user) {
      const authenticated = await bcrypt.compare(req.body.password, user.password);
      if (authenticated) {
        const token = generateAuthToken(user.userId);
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
router.get('/users/:userId', requireAuth, async function (req, res, next) {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ where: { userId } });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Placeholder Route to ensure server is working
router.get('/', (req, res) => {
  res.json({ message: 'Users route placeholder' });
});

module.exports = router;
