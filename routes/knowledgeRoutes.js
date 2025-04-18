const express = require('express');
const { addKnowledge } = require('../controllers/knowledgeController');

const router = express.Router();

// Route for adding knowledge
router.post('/', addKnowledge);

module.exports = router;
