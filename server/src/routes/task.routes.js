const express = require('express');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment
} = require('../controllers/task.controller');
const { authenticate, canModifyTask, requireProjectMember } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Project specific task routes (moved from project routes for clarity or kept here)
router.get('/project/:id', requireProjectMember, getTasks);
router.post('/project/:id', requireProjectMember, createTask);

// Individual task routes
router.get('/:id', getTaskById);
router.patch('/:id', canModifyTask, updateTask);
router.delete('/:id', canModifyTask, deleteTask);

// Comments
router.post('/:id/comments', requireProjectMember, addComment);
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
