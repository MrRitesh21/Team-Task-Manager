const prisma = require('../services/prisma.service');

const getTasks = async (req, res) => {
  const { id: projectId } = req.params;
  const { status, assigneeId, priority } = req.query;

  try {
    const filters = { projectId };
    if (status) filters.status = status;
    if (assigneeId) filters.assigneeId = assigneeId;
    if (priority) filters.priority = priority;

    const tasks = await prisma.task.findMany({
      where: filters,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createTask = async (req, res) => {
  const { id: projectId } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const creatorId = req.user.id;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId,
        assigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const data = {};
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id }
    });

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const addComment = async (req, res) => {
  const { id: taskId } = req.params;
  const { content } = req.body;
  const authorId = req.user.id;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment
};
