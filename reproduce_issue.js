
const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- Starting Reproduction Script (Fetch) ---');

        // 1. Register Student
        const studentEmail = `student_${Date.now()}@test.com`;
        const password = 'password123';
        console.log(`1. Registering student: ${studentEmail}`);

        let studentRegRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                email: studentEmail,
                password: password,
                confirmPassword: password,
                studentId: 'ST123',
                department: 'CS'
            })
        });

        if (studentRegRes.status === 400) {
            console.log('   Student probably exists, proceeding...');
        }

        // 2. Login Student
        console.log('2. Logging in as student...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: studentEmail, password: password })
        });
        const loginData = await loginRes.json();
        const studentToken = loginData.token;
        console.log('   Student logged in.');

        // 3. Create Complaint
        console.log('3. Creating complaint...');
        const complaintRes = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                title: 'Broken Projector',
                description: 'Projector in Room 101 is not working',
                location: 'Room 101',
                category: 'Classroom'
            })
        });
        const complaintData = await complaintRes.json();
        const complaintId = complaintData.complaint._id;
        console.log(`   Complaint created: ${complaintId}`);

        // 4. Login Admin
        console.log('4. Logging in as admin...');
        const adminEmail = 'admin@campus.com';
        const adminPassword = 'Admin@123456';

        const adminLoginRes = await fetch(`${API_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPassword })
        });
        const adminLoginData = await adminLoginRes.json();
        const adminToken = adminLoginData.token;
        console.log('   Admin logged in.');

        // 5. Update Complaint Status
        console.log('5. Updating complaint status to "Completed"...');
        const updateRes = await fetch(`${API_URL}/complaints/${complaintId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                status: 'Completed',
                priority: 'High',
                remarks: 'Fixed by technician'
            })
        });
        const updateData = await updateRes.json();
        console.log('   Update response message:', updateData.message);

        // 6. Verify Update
        console.log('6. Verifying update...');
        const verifyRes = await fetch(`${API_URL}/complaints`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const verifyData = await verifyRes.json();

        const updatedComplaint = verifyData.complaints.find(c => c._id === complaintId);

        console.log('   Fetched complaint status:', updatedComplaint.status);
        console.log('   Fetched complaint priority:', updatedComplaint.priority);
        console.log('   Fetched complaint remarks:', updatedComplaint.remarks);

        if (updatedComplaint.status === 'Completed' &&
            updatedComplaint.priority === 'High' &&
            updatedComplaint.remarks === 'Fixed by technician') {
            console.log('SUCCESS: Changes were stored correctly!');
        } else {
            console.error('FAILURE: Changes were NOT stored correctly!');
            console.error('Expected: Completed, High, Fixed by technician');
            console.error(`Actual: ${updatedComplaint.status}, ${updatedComplaint.priority}, ${updatedComplaint.remarks}`);
        }

    } catch (error) {
        console.error('Error running test:', error);
    }
}

setTimeout(runTest, 1000);
