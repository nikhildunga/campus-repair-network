
const mongoose = require('mongoose');
const Complaint = require('./backend/models/Complaint');
const User = require('./backend/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const seedData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Find student
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
        console.log('Creating meaningful complaint...');
        const complaint = await Complaint.create({
            title: 'Urgent: Server Room AC Broken',
            description: 'The air conditioning in the main server room is not cooling. Temperature is rising.',
            location: 'Server Room B',
            category: 'Electrical',
            status: 'Pending',
            priority: 'High',
            reportedBy: student._id,
            studentName: student.name,
            studentEmail: student.email,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Complaint created successfully:', complaint._id);
        console.log('Data should now be visible in Admin Dashboard.');
        process.exit(0);

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
