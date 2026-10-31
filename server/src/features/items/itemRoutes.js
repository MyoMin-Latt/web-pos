import { Router } from 'express';
import { listItems, createItem, updateItem, deleteItem } from './itemController.js';
import { auth, requireRole } from '../../middleware/auth.js';
const r = Router(); r.use(auth);
r.get('/', listItems); r.post('/', requireRole('admin'), createItem); r.put('/:id', requireRole('admin'), updateItem); r.delete('/:id', requireRole('admin'), deleteItem);
export default r;
