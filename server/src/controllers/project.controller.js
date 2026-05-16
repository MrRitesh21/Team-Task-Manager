const prisma = require('../services/prisma.service');

const getProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            members: {
              take: 5,
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            },
            _count: {
              select: {
                members: true,
                tasks: true
              }
            }
          }
        }
      }
    });

    const projects = memberships.map(m => ({
      ...m.project,
      role: m.role
    }));

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createProject = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name,
          description
        }
      });

      await tx.projectMember.create({
        data: {
          userId,
          projectId: newProject.id,
          role: 'ADMIN'
        }
      });

      return newProject;
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { name, description }
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const addMember = async (req, res) => {
  const { id: projectId } = req.params;
  const { email, role } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: role || 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const removeMember = async (req, res) => {
  const { id: projectId, userId } = req.params;

  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    res.json({ message: 'Member removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const joinProjectByCode = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { inviteCode }
    });

    if (!project) {
      return res.status(404).json({ error: 'Invalid invite code.' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: project.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this project.' });
    }

    await prisma.projectMember.create({
      data: {
        userId,
        projectId: project.id,
        role: 'MEMBER'
      }
    });

    res.json({ message: 'Successfully joined the project!', projectId: project.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  joinProjectByCode
};
