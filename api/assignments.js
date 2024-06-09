const express = require('express');
const router = express.Router();
const {requireAuth, requireRole} = require('../lib/auth');
const {Course} = require('../models/course');
const {User} = require('../models/user');
const { Assignment,AssignmentClientFields } = require('../models/assignment');
const { Submission,SubmissionClientFields } = require('../models/submission');
const {ValidationError} = require('sequelize');
const multer = require('multer');
const crypto = require('crypto');
const {Enrollment} = require('../models/enrollment');

const fileType = {
  'application/pdf': 'pdf'
};

const storage = multer.diskStorage({
  destination: `${__dirname}/uploads`,
  filename: (req, file, callback) => {
    const filename = crypto.pseudoRandomBytes(16).toString('hex');
    const extension = fileType[file.mimetype];
    callback(null, `${filename}.${extension}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    callback(null, !!fileType[file.mimetype]);
  }
});

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

/*
  *POST create assignment.
*/
router.post('/', requireAuth, requireRole('admin','instructor'), async function (req, res, next) {
  try {
    const { title, points, due, courseId} = req.body;
    const course = await Course.findByPk(courseId);
    const user = await User.findByPk(req.user.id);

    if (user.role !== "admin" && user.id !== course.instructorId) {
      return res.status(403).send({ error: "Forbidden: Admin or instructor access required" });
    }
    const existingAssignment = await Assignment.findOne({ where: {title, points, due } });
    if (existingAssignment) {
      return res.status(400).send({ error: "FAILURE: Assignment already exists" });
    }

    const assignment = await Assignment.create(req.body, AssignmentClientFields);
    res.status(201).send({ message: "SUCCESS: Course Assignment", id: assignment.id });
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

/*
  *PUT update assignment.
*/
router.patch('/:id', requireAuth,requireRole("admin","instructor"), async function (req, res, next) {
  try {
    const { title, points, due, courseId } = req.body;
    const course = await Course.findByPk(courseId);
    const user = await User.findByPk(req.user.id);

    if (user.role !== "admin" && user.id !== course.instructorId) {
      return res.status(403).send({ error: "Forbidden: Admin or instructor access required" });
    }

    const assignment = await Assignment.findByPk(req.params.id);
    if (assignment) {
      await assignment.update(req.body, AssignmentClientFields);
      res.status(200).json(assignment);
    } else {
      next();
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.errors[0].message });
    } else {
      next(err);
    }
  }
});

/*
  *DELETE delete assignment.
*/
router.delete('/:id', requireAuth,requireRole("admin","instructor"), async function (req, res, next) {
  const {title, points, due, courseId} = req.body;
  const course = await Course.findByPk(courseId);
  const user = await User.findByPk(req.user.id);
  
  if (user.role !== "admin" && user.id !== course.instructorId) {
    return res.status(403).send({ error: "Forbidden: Admin or instructor access required" });
  }

  const assignment = await Assignment.findByPk(req.params.id);
  if (assignment) {
    await assignment.destroy();
    res.status(204).end();
  } else {
    next();
  }
});

/*
  *GET assignments list of Submissions
*/
router.get('/:id/submissions',requireAuth,requireRole("admin","instructor"), async function (req, res, next) {
    const{title, points, due, courseId} = req.body;
    const course = await Course.findByPk(courseId);
    const user = await User.findByPk(req.user.id);

    if (user.role !== "admin" && user.id !== course.instructorId) {
      return res.status(403).send({ error: "Forbidden: Admin or instructor access required" });
    }else{
      let page = parseInt(req.query.page) || 1
      page = page < 1 ? 1 : page
      const numPerPage = 10
      const offset = (page - 1) * numPerPage
    
      const result = await Submission.findAndCountAll({
        limit: numPerPage,
        offset: offset
      });
    
      const lastPage = Math.ceil(result.count / numPerPage)
      const links = {}
      if (page < lastPage) {
        links.nextPage = `/submissions?page=${page + 1}`
        links.lastPage = `/submissions?page=${lastPage}`
      }
      if (page > 1) {
        links.prevPage = `/submissions?page=${page - 1}`
        links.firstPage = '/submissions?page=1'
      }
    
      res.status(200).json({
        submissions: result.rows,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: result.count,
        links: links
      
    });
  }
  });

/*
  *POST assignment submission.
*/
router.post('/:id/submissions', requireAuth, requireRole('student'), upload.single('file'), async function (req, res, next) {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;
    const { timestamp } = req.body;
    const file = req.file;

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const enrollment = await Enrollment.findOne({ where: { courseId: assignment.courseId, studentId: studentId } });
    if (!enrollment) {
      return res.status(403).json({ error: 'Forbidden: Not enrolled in the course' });
    }

    const submission = await Submission.create({
      assignmentId,
      studentId,
      timestamp,
      file: file.path
    }, { fields: SubmissionClientFields });

    res.status(201).json({ message: "Submission created successfully", submission });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
