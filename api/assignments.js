const express = require('express');
const router = express.Router();
const { Assignment,AssignmentClientFields } = require('../models/assignment');
const {ValidationError} = require('sequelize');

/* 
  *GET assignments listing.
*/
router.get('/', async function (req, res) {

  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Assignment.findAndCountAll({
    limit: numPerPage,
    offset: offset
  });

  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/assignments?page=${page + 1}`
    links.lastPage = `/assignments?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/assignments?page=${page - 1}`
    links.firstPage = '/assignments?page=1'
  }

  res.status(200).json({
    assignments: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  });
});

/*
  *GET assignments by id.
*/
router.get('/:id', async function (req, res, next) {
  const assignment = await Assignment.findByPk(req.params.id);
  if (assignment) {
    res.status(200).json(assignment);
  } else {
    next();
  }
});
module.exports = router;