const express = require('express');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole
} = require('../controllers/project.controller');
const { authenticate, requireProjectRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.patch('/:id', requireProjectRole('ADMIN'), updateProject);
router.delete('/:id', requireProjectRole('ADMIN'), deleteProject);

router.post('/:id/members', requireProjectRole('ADMIN'), addMember);
router.delete('/:id/members/:userId', requireProjectRole('ADMIN'), removeMember);
router.patch('/:id/members/:userId', requireProjectRole('ADMIN'), updateMemberRole);

module.exports = router;
