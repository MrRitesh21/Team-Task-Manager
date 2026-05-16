const bcrypt = require('bcryptjs');
const prisma = require('../services/prisma.service');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user, accessToken });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing.' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully.' });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
