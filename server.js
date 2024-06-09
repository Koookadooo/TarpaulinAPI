require('dotenv').config();
require('./models/associations');

const express = require('express')
const morgan = require('morgan')
const redis = require('redis');
const sequelize = require('./lib/sequelize')
const api = require('./api')

const app = express()
const port = process.env.PORT || 8000

const redisHost = process.env.REDIS_HOST;
const redisPort = 8000;

const redisClient = redis.createClient();

app.use(morgan('dev'))
app.use(express.json())
app.use(express.static('public'))
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      error: "Server error.  Please try again later."
  })
})

sequelize.sync().then(function () {
  redisClient.connect().then(function () {
    app.listen(port, function () {
      console.log("== Server is listening on port:", port)
      console.log(`=== Redis server listening ===`)
    })
  })
})