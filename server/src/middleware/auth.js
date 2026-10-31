import jwt from 'jsonwebtoken';
export function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me'); next(); }
  catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
    next();
  };
}
