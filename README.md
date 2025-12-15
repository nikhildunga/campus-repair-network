# Campus Connect Repair System - Full Stack Project

A complete web application for managing campus repair complaints with student and admin interfaces.

## 🎯 Project Features

### Student Features
- ✅ User registration and JWT authentication
- ✅ Submit repair complaints with title, description, location, and category
- ✅ Upload photos of issues
- ✅ View all their submitted complaints
- ✅ Track complaint status (Pending, In-Progress, Completed)
- ✅ View admin remarks on complaints

### Admin Features
- ✅ Admin login with JWT authentication
- ✅ View all submitted complaints in a dashboard table
- ✅ Update complaint status and priority
- ✅ Add remarks for students
- ✅ Delete complaints
- ✅ Dashboard statistics (total, pending, in-progress, completed)
- ✅ Filter complaints by status

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (Vanilla)** - Interactivity
- **Fetch API** - HTTP requests

## 📁 Project Structure

```
campus-connect-repair/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── complaint_form.html
    ├── admin_login.html
    ├── admin_dashboard.html
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── student.js
        └── admin.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: MongoDB Setup

**Option A: Local MongoDB**
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get the connection string

### Step 2: Backend Setup

1. Navigate to backend directory:
   ```bash
   cd campus-connect-repair/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/Update `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/campus-connect-repair
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   ADMIN_EMAIL=admin@campus.com
   ADMIN_PASSWORD=Admin@123456
   ```

   **For MongoDB Atlas:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-connect-repair
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   ADMIN_EMAIL=admin@campus.com
   ADMIN_PASSWORD=Admin@123456
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   Or with auto-reload (install nodemon first):
   ```bash
   npm install -g nodemon
   nodemon server.js
   ```

   The server will start on `http://localhost:5000`

### Step 3: Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd campus-connect-repair/frontend
   ```

2. Open `index.html` in a web browser or use a local server:
   
   **Using Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npm install -g http-server
   http-server -p 8000
   ```

   Access the app at `http://localhost:8000`

## 📝 Default Credentials

### Admin Login
- **Email:** admin@campus.com
- **Password:** Admin@123456

### Test Student Account
- **Email:** student@example.com
- **Password:** password123

(Create your own student account through the registration page)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login student
- `POST /api/auth/admin-login` - Login admin

### Complaints (Student)
- `POST /api/complaints` - Submit new complaint (with file upload)
- `GET /api/complaints/my` - Get user's complaints

### Complaints (Admin)
- `GET /api/complaints` - Get all complaints
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `GET /api/complaints/stats/dashboard` - Get dashboard statistics

## 🧪 Testing the Application

### Test Flow 1: Student Flow
1. Go to `http://localhost:8000`
2. Click "Student Register"
3. Fill in registration form and submit
4. You'll be redirected to dashboard (no complaints yet)
5. Click "Submit New Complaint"
6. Fill complaint form and submit with/without photo
7. View your complaint in dashboard with status
8. Logout

### Test Flow 2: Admin Flow
1. Go to `http://localhost:8000`
2. Click "Admin Login"
3. Use default credentials: admin@campus.com / Admin@123456
4. View all complaints in the table
5. Click "Edit" to update status, priority, and add remarks
6. Click "Delete" to remove complaints
7. View real-time statistics
8. Use filters to filter by status
9. Logout

## 📸 Key Features Walkthrough

### 1. JWT Authentication
- Tokens are generated on login and stored in localStorage
- Tokens expire after 7 days
- Protected routes require valid token

### 2. File Uploads
- Photos are stored in `backend/uploads/` folder
- Multer validates image files (JPEG, PNG, GIF)
- Max file size: 5MB
- Files are served via Express static middleware

### 3. Complaint Status Flow
```
Submit → Pending → In-Progress → Completed
```

### 4. Data Validation
- Email format validation
- Password strength checking (min 6 characters)
- File type and size validation
- Required field validation

## 🔒 Security Features

- ✅ Password hashing using bcryptjs
- ✅ JWT token-based authentication
- ✅ XSS protection (HTML escaping)
- ✅ CORS enabled
- ✅ Protected API routes
- ✅ Admin role verification

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Check if MongoDB service is running
- Verify MONGO_URI in .env file
- Check database credentials for Atlas

### Port 5000 already in use
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000

### File upload not working
- Check `backend/uploads/` folder exists
- Verify file size < 5MB
- Ensure correct image format

### CORS errors
- Ensure backend is running on http://localhost:5000
- Check CORS middleware is enabled
- Frontend should be on different port (8000)

### Token expired
- Clear localStorage and login again
- Tokens expire after 7 days

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Introduction](https://jwt.io/introduction)
- [Mongoose ODM](https://mongoosejs.com)
- [Multer Documentation](https://github.com/expressjs/multer)

## 🚀 Deployment

### Deploy Backend (Heroku)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret_key

# Deploy
git push heroku main
```

### Deploy Frontend (Netlify/Vercel)
1. Push code to GitHub
2. Connect to Netlify/Vercel
3. Update API_URL in frontend/js/auth.js to backend URL
4. Deploy

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer Notes

- All passwords are hashed using bcryptjs with 10 salt rounds
- JWT secret should be changed in production
- MongoDB should use authentication in production
- Implement rate limiting for API endpoints in production
- Add logging system for production
- Use HTTPS in production
- Add email notifications for status updates

## ✨ Future Enhancements

- Email notifications for status updates
- Real-time notifications using WebSockets
- Advanced complaint search and filtering
- Complaint priority assignment by admin
- SLA tracking (time to resolve)
- Monthly reports and analytics
- Mobile app (React Native/Flutter)
- Complaint assignment to specific maintenance teams
- Status history tracking
- User profile management
- Two-factor authentication

---

**Happy Coding! 🚀**
