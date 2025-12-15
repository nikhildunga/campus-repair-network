
const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

const commonOptions = {
    hostname: 'localhost',
    port: 5000,
    headers: { 'Content-Type': 'application/json' }
};

async function runTest() {
    try {
        console.log('--- Starting Reproduction Script (HTTP) ---');

        // 1. Register/Login Student to get Token
        console.log('1. Mocking Student...');
        const studentEmail = `student_${Date.now()}@test.com`;
        await request({ ...commonOptions, path: '/api/auth/register', method: 'POST' }, {
            name: 'Test Student',
            email: studentEmail,
            password: 'password123',
            confirmPassword: 'password123',
            studentId: 'ST123',
            department: 'CS'
        });

        // Login to be sure
        const loginRes = await request({ ...commonOptions, path: '/api/auth/login', method: 'POST' }, {
            email: studentEmail,
            password: 'password123'
        });
        const studentToken = loginRes.data.token;

        // 2. Create Complaint
        console.log('2. Creating complaint...');
        const createRes = await request({
            ...commonOptions,
            path: '/api/complaints',
            method: 'POST',
            headers: { ...commonOptions.headers, 'Authorization': `Bearer ${studentToken}` }
        }, {
            title: 'Test Complaint',
            description: 'Test Description',
            location: 'Test Loc',
            category: 'Classroom'
        });
        const complaintId = createRes.data.complaint._id;
        console.log(`   Complaint ID: ${complaintId}`);

        // 3. Login Admin
        console.log('3. Logging in as Admin...');
        const adminRes = await request({ ...commonOptions, path: '/api/auth/admin-login', method: 'POST' }, {
            email: 'admin@campus.com',
            password: 'Admin@123456'
        });
        const adminToken = adminRes.data.token;

        // 4. Update Complaint
        console.log('4. Updating Complaint...');
        const updateRes = await request({
            ...commonOptions,
            path: `/api/complaints/${complaintId}`,
            method: 'PUT',
            headers: { ...commonOptions.headers, 'Authorization': `Bearer ${adminToken}` }
        }, {
            status: 'Completed',
            priority: 'High',
            remarks: 'Fixed!'
        });
        console.log('   Update Status:', updateRes.status);
        console.log('   Update Message:', updateRes.data.message);

        // 5. Verify
        console.log('5. Verifying...');
        const verifyRes = await request({
            ...commonOptions,
            path: '/api/complaints',
            method: 'GET',
            headers: { ...commonOptions.headers, 'Authorization': `Bearer ${adminToken}` }
        });

        const complaint = verifyRes.data.complaints.find(c => c._id === complaintId);
        console.log('   Final Status:', complaint.status);
        console.log('   Final Priority:', complaint.priority);
        console.log('   Final Remarks:', complaint.remarks);

        if (complaint.status === 'Completed' && complaint.priority === 'High' && complaint.remarks === 'Fixed!') {
            console.log('SUCCESS: Data stored correctly.');
        } else {
            console.log('FAILURE: Data NOT stored correctly.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

setTimeout(runTest, 1000);
