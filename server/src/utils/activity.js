const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logActivity = async ({ type, content, userId, projectId }) => {
  try {
    await prisma.activity.create({
      data: {
        type,
        content,
        userId,
        projectId
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
