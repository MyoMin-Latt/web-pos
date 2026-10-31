import { Router } from 'express';
import { listInvoices, createInvoice, getInvoice } from './invoiceController.js';
import { auth } from '../../middleware/auth.js';
const r = Router(); r.use(auth);
r.get('/', listInvoices); r.post('/', createInvoice); r.get('/:id', getInvoice);
export default r;
