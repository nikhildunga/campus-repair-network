
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cleanAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Clean Complaints
        console.log('Clearing old complaints...');
        await Complaint.deleteMany({});

        // 2. Get Student
        let student = await User.findOne({ role: 'student' });
        if (!student) {
            student = await User.create({
                name: 'Demo Student',
                email: 'demo@student.com',
                password: 'password123',
                role: 'student',
                studentId: 'D123',
                department: 'General'
            });
        }

        // 3. Seed fresh data
        const complaints = [
            {
                title: 'Broken Projector',
                description: 'Projector in Room 101 is flickering.',
                location: 'Room 101',
                category: 'Classroom',
                status: 'Pending',
                priority: 'High',
                reportedBy: student._id,
                studentName: student.name,
                studentEmail: student.email
            },
            {
                title: 'Leaking Faucet',
                description: 'Restroom faucet is dripping constantly.',
                location: '2nd Floor Restroom',
                category: 'Plumbing',
                status: 'In-Progress',
                priority: 'Medium',
                reportedBy: student._id,
                studentName: student.name,
                studentEmail: student.email
            },
            {
                title: 'Wifi Issue',
                description: 'No signal in the library corner.',
                location: 'Library',
                category: 'Other',
                status: 'Completed',
                priority: 'Low',
                reportedBy: student._id,
                studentName: student.name,
                studentEmail: student.email
            }
        ];

        await Complaint.insertMany(complaints);
        console.log('Seeded 3 fresh complaints.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanAndSeed();
