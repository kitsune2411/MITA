const express = require('express');
const { handleQuery } = require('../controllers/queryController');

const router = express.Router();

// Route for handling student query
router.post('/', handleQuery);

module.exports = router;
