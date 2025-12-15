require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

(async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    const complaintCount = await Complaint.countDocuments();
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5).lean();

    console.log(JSON.stringify({ userCount, complaintCount, recentComplaints }, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('DB check error:', error.message || error);
    process.exit(1);
  }
})();
