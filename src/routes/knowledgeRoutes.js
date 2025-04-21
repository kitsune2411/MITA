const express = require('express');
const {
    addKnowledge,
    deleteKnowledge,
    restoreKnowledge,
    getAllKnowledge
} = require('../controllers/knowledgeController');

const router = express.Router();

// Route for adding knowledge
router.post('/add', addKnowledge);

// Route for soft-deleting knowledge
router.delete('/:id', deleteKnowledge);

// Route for restoring deleted knowledge
router.patch('/:id/restore', restoreKnowledge);

// Route for listing all active (non-deleted) knowledge
router.get('/', getAllKnowledge);

module.exports = router;
