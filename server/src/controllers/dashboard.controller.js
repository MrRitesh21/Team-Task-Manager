const prisma = require('../services/prisma.service');
const { startOfDay, endOfDay } = require('date-fns');

const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get all projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    const projectIds = memberships.map(m => m.projectId);

    // Total tasks in user's projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } }
    });

    // Tasks by status
    const byStatus = {
      todo: await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      inProgress: await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      inReview: await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_REVIEW' } }),
      done: await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } })
    };

    // Overdue tasks (due date before now and not done)
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: new Date() }
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, avatar: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    // My tasks (assigned to current user and not done)
    const myTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' }
      },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    // Recent activity (simple implementation: recently updated tasks)
    const recentActivity = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, avatar: true } }
      },
      take: 10
    });

    res.json({
      totalTasks,
      byStatus,
      overdueTasks,
      myTasks,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getDashboardStats
};
