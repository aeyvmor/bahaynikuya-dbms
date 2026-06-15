import { Router } from 'express';
import { prisma } from '../db';
import { hashPassword, verifyPassword, signToken, publicUser } from '../lib/auth';
import { requireAuth } from '../middleware/requireAuth';
import { serialize } from '../lib/serialize';
import { registerSchema, loginSchema, profileSchema, passwordSchema } from '../lib/schemas';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: serialize(publicUser(user)) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: serialize(publicUser(user)) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    res.json({ user: serialize(publicUser(user)) });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, email } = profileSchema.parse(req.body);

    const clash = await prisma.user.findFirst({
      where: { email, NOT: { id: req.auth!.userId } },
    });
    if (clash) return res.status(409).json({ error: 'That email is already in use.' });

    const user = await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { name, email },
    });
    res.json({ user: serialize(publicUser(user)) });
  } catch (err) {
    next(err);
  }
});

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
