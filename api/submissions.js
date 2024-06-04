const express = require('express');
const router = express.Router();

// Placeholder Route to ensure server is working
router.get('/', (req, res) => {
  res.json({ message: 'Submissions route placeholder' });
});

module.exports = router;
