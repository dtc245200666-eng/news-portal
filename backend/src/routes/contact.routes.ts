import { Router } from 'express';
import { submitContact, getContactMessages, markContactRead } from '../controllers/contact.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { contactSchema } from '../validators/common.validator';

const router = Router();

// Public submission
router.post('/', validate(contactSchema), submitContact);

// Admin review
router.get('/', authenticate, requireAdmin, getContactMessages);
router.patch('/:id/read', authenticate, requireAdmin, markContactRead);

export default router;
