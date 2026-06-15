import { Router } from 'express';
import { contactSchema } from '../lib/schemas';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);
    console.log('[contact] New inquiry:', { name: data.name, email: data.email, subject: data.subject });
    res.status(201).json({ ok: true, message: 'Thank you for reaching out. We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
});

export default router;
