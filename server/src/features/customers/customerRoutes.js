import { Router } from 'express';
import { listCustomers, createCustomer, updateCustomer, deleteCustomer, customerHistory } from './customerController.js';
import { auth } from '../../middleware/auth.js';
const r = Router(); r.use(auth);
r.get('/', listCustomers); r.post('/', createCustomer); r.put('/:id', updateCustomer); r.delete('/:id', deleteCustomer); r.get('/:id/history', customerHistory);
export default r;
