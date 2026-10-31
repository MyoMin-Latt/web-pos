import mongoose from 'mongoose';
export let dbReady = false;
export async function connectDB(uri) {
  if (!uri) { console.warn('[DB] No MONGO_URI set — running in DEMO in-memory mode. Set MONGO_URI for real persistence.'); return false; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    dbReady = true;
    console.log('[DB] MongoDB connected');
    return true;
  } catch (err) {
    console.warn('[DB] WARNING: MongoDB unreachable:', err.message);
    console.warn('[DB] Server stays up in DEMO in-memory mode. Health endpoint remains live; set a valid MONGO_URI and restart for real persistence.');
    return false;
  }
}
export function isDbReady() { return dbReady && mongoose.connection.readyState === 1; }
