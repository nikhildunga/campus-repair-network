const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-connect-repair');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const verify = async () => {
    await connectDB();
    const count = await Complaint.countDocuments();
    console.log(`Total Complaints in DB: ${count}`);
    const complaints = await Complaint.find({});
    console.log(JSON.stringify(complaints, null, 2));
    process.exit();
};

verify();
