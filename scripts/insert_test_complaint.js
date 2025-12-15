require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

(async () => {
  try {
    await connectDB();

    // Find a student user to associate the complaint with
    const student = await User.findOne({ role: 'student' }).lean();
    if (!student) {
      console.error('No student user found. Create a student first.');
      process.exit(1);
    }

    const complaint = await Complaint.create({
      title: 'Automated Test Complaint',
      description: 'This complaint was inserted by insert_test_complaint.js',
      location: 'Test Location',
      category: 'Other',
      reportedBy: student._id,
      studentName: student.name,
      studentEmail: student.email,
      status: 'Pending',
      priority: 'Medium',
    });

    console.log('Inserted complaint:', complaint._id.toString());
    process.exit(0);
  } catch (error) {
    console.error('Insert test complaint error:', error.message || error);
    process.exit(1);
  }
})();
