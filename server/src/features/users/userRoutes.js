import { Router } from 'express';
import { register, login, me, listUsers } from './userController.js';
import { auth, requireRole } from '../../middleware/auth.js';
const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', auth, me);
r.get('/', auth, requireRole('admin'), listUsers);
export default r;
