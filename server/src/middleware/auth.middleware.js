const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../services/prisma.service');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatar: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireProjectRole = (role) => {
  return async (req, res, next) => {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    try {
      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId
          }
        }
      });

      if (!membership || (role === 'ADMIN' && membership.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Insufficient permissions for this project.' });
      }

      req.projectRole = membership.role;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error.' });
    }
  };
};

const requireProjectMember = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId;
  const userId = req.user.id;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const canModifyTask = async (req, res, next) => {
  const { id: taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const membership = task.project.members.find(m => m.userId === userId);
    
    if (!membership) {
      return res.status(403).json({ error: 'Not authorized to modify this task.' });
    }

    // ADMIN or Creator or Assignee can modify
    if (membership.role === 'ADMIN' || task.creatorId === userId || task.assigneeId === userId) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions to modify this task.' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  authenticate,
  requireProjectRole,
  requireProjectMember,
  canModifyTask
};
