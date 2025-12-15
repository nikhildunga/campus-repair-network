(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const fetch = global.fetch;

    console.log('Registering test student...');
    let res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    let data = await res.json();
    console.log('Register response:', res.status, data);

    if (!res.ok && data.message && data.message.includes('already')) {
      console.log('Student already exists, will continue.');
    }

    console.log('Logging in as student...');
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teststudent@example.com', password: 'Password123' }),
    });
    data = await res.json();
    console.log('Login response:', res.status, data);
    if (!res.ok) throw new Error('Student login failed');
    const token = data.token;

    console.log('Submitting complaint...');
    const formData = new FormData();
    formData.append('title', 'Test Complaint');
    formData.append('description', 'This is a test complaint');
    formData.append('location', 'Library');
    formData.append('category', 'Electrical');

    res = await fetch(`${base}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    data = await res.json();
    console.log('Submit response:', res.status, data);

    console.log('Admin login...');
    res = await fetch(`${base}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.com', password: 'Admin@123456' }),
    });
    data = await res.json();
    console.log('Admin login response:', res.status, data);
    if (!res.ok) throw new Error('Admin login failed');
    const adminToken = data.token;

    console.log('Fetching all complaints...');
    res = await fetch(`${base}/complaints`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log('All complaints:', res.status, data);

    console.log('Fetching dashboard stats...');
    res = await fetch(`${base}/complaints/stats/dashboard`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log('Stats:', res.status, data);

    console.log('Done.');
  } catch (error) {
    console.error('Test flow error:', error);
    process.exit(1);
  }
})();
