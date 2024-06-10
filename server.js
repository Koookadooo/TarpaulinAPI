require('dotenv').config();
require('./models/associations');

const express = require('express');
const morgan = require('morgan');
const sequelize = require('./lib/sequelize');
const api = require('./api');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 8000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

// Apply the rate limiter to all requests
app.use(limiter);

app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

app.use('*', function (err, req, res, next) {
  console.error("== Error:", err);
  res.status(500).send({
    error: "Server error. Please try again later."
  });
});

sequelize.sync().then(function () {
  app.listen(port, function () {
    console.log("== Server is listening on port:", port);
  });
});
