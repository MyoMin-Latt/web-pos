import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './features/users/userModel.js';
import Item from './features/items/itemModel.js';
import Customer from './features/customers/customerModel.js';
import { memory } from './store.js';
const ok = await connectDB(process.env.MONGO_URI);
if (!ok) { console.log('Seed skipped: MongoDB unreachable. Demo in-memory data is already available via store.js.'); process.exit(0); }
await User.deleteMany({}); await Item.deleteMany({}); await Customer.deleteMany({});
await User.create([
  { name: 'Demo Admin', email: 'admin@pos.local', passwordHash: await bcrypt.hash('Admin123!', 10), role: 'admin' },
  { name: 'Demo Cashier', email: 'cashier@pos.local', passwordHash: await bcrypt.hash('Cashier123!', 10), role: 'cashier' },
]);
await Item.insertMany(memory.items.map(({ _id, ...rest }) => rest));
await Customer.insertMany(memory.customers.map(({ _id, ...rest }) => rest));
console.log('Seeded: 2 users, 12 items, 5 customers');
await mongoose.disconnect();
