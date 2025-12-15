// Database Connection Configuration with fallback support
const mongoose = require('mongoose');

/**
 * Attempt to connect to one of multiple MongoDB URIs.
 * - Use `MONGO_URIS` (comma-separated) first, then fallback to `MONGO_URI`.
 * - Returns true on success, false on failure (does NOT exit process).
 */
const connectDB = async () => {
  const uris = [];
  if (process.env.MONGO_URIS) {
    uris.push(...process.env.MONGO_URIS.split(',').map(u => u.trim()).filter(Boolean));
  }
  if (process.env.MONGO_URI) uris.push(process.env.MONGO_URI);
  // default local
  if (uris.length === 0) uris.push('mongodb://localhost:27017/campus-connect-repair');

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB connected successfully -> ${uri}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ MongoDB connect failed for ${uri}: ${error.message}`);
      // try next URI
    }
  }

  console.error('❌ All MongoDB connection attempts failed');
  return false;
};

module.exports = connectDB;
