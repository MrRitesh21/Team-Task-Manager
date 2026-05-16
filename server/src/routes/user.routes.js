const express = require('express');
const { searchUsers, updateProfile, changePassword } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/search', searchUsers);
router.patch('/profile', updateProfile);
router.patch('/password', changePassword);

module.exports = router;
