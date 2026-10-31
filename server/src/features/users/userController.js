import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import { isDbReady } from '../../config/db.js';
import { memory } from '../../store.js';
const sign = (u) => jwt.sign({ id: u._id, email: u.email, role: u.role, name: u.name }, process.env.JWT_SECRET || 'dev-secret-change-me', { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
export async function register(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
  if (isDbReady()) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const u = await User.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role: role === 'admin' ? 'admin' : 'cashier' });
    return res.status(201).json({ user: pub(u), token: sign(u) });
  }
  if (memory.users.find((u) => u.email === email.toLowerCase())) return res.status(400).json({ message: 'Email already registered' });
  const u = { _id: `u-${Date.now()}`, name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role: role === 'admin' ? 'admin' : 'cashier' };
  memory.users.push(u);
  res.status(201).json({ user: pub(u), token: sign(u) });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const u = isDbReady()
    ? await User.findOne({ email: (email || '').toLowerCase() })
    : memory.users.find((x) => x.email === (email || '').toLowerCase());
  if (!u || !(await bcrypt.compare(password || '', u.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ user: pub(u), token: sign(u) });
}
export async function me(req, res) { res.json({ user: req.user }); }
export async function listUsers(req, res) {
  const users = isDbReady() ? await User.find().select('-passwordHash') : memory.users.map(pub);
  res.json(users);
}
