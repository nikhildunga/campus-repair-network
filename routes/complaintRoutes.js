// Complaint Routes - CRUD operations for complaints
const express = require('express');
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, adminProtect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Only image files are allowed');
    }
  },
});

// @route   POST /api/complaints
// @desc    Create a new complaint (Student)
// @access  Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body;
    console.log('POST /api/complaints received', { user: req.user?.id, title, location, category });

    // Validate input
    if (!title || !description || !location || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Get student details from database
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      location,
      category,
      reportedBy: req.user.id,
      studentName: student.name,
      studentEmail: student.email,
      photo: req.file ? req.file.filename : null,
    });

    console.log('Complaint created:', complaint._id);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message,
    });
  }
});

// @route   GET /api/complaints/my
// @desc    Get all complaints by logged-in student
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ reportedBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints (Admin only)
// @access  Private/Admin
router.get('/', adminProtect, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    console.log('GET /api/complaints (admin) returning', complaints.length, 'complaints');

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status (Admin only)
// @access  Private/Admin
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { status, remarks, priority } = req.body;
    console.log(`PUT /api/complaints/${req.params.id} received:`, { status, priority, remarks });

    // Validate status
    const validStatus = ['Pending', 'In-Progress', 'Completed'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Build update object explicitly to avoid undefined overwrites
    const updateFields = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (remarks !== undefined) updateFields.remarks = remarks;

    // Update complaint
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    console.log('Complaint updated successfully:', complaint);

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message,
    });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete a complaint (Admin only)
// @access  Private/Admin
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message,
    });
  }
});

// @route   GET /api/complaints/stats/dashboard
// @desc    Get complaint statistics (Admin only)
// @access  Private/Admin
router.get('/stats/dashboard', adminProtect, async (req, res) => {
  try {
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In-Progress' });
    const completed = await Complaint.countDocuments({ status: 'Completed' });
    const total = pending + inProgress + completed;

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        completed,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
});

module.exports = router;
