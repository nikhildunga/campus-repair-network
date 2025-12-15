
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', process.env.MONGO_URI);

        // Find or create student
        let student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('Creating demo student...');
            student = await User.create({
                name: 'Demo Student',
                email: 'demo@student.com',
                password: 'password123',
                role: 'student',
                studentId: 'D123',
                department: 'General'
            });
        }

        // Create a visible complaint
        console.log('Creating simple urgent complaint...');
        const complaint = await Complaint.create({
            title: 'Emergency: Water Leak',
            description: 'Massive water leak using seed script to verify display.',
            location: 'Main Hall',
            category: 'Plumbing',
            status: 'Pending',
            priority: 'High',
            reportedBy: student._id,
            studentName: student.name,
            studentEmail: student.email,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Complaint created:', complaint.title);
        process.exit(0);

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
