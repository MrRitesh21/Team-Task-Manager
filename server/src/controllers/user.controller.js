const bcrypt = require('bcryptjs');
const prisma = require('../services/prisma.service');

const searchUsers = async (req, res) => {
  const { q } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, avatar } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  searchUsers,
  updateProfile,
  changePassword
};
