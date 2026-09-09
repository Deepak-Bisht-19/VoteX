# 🗳️ VoteX - Online Election Management System

VoteX is a full-stack **Online Election Management System** built using **React.js, Node.js, Express.js, and MongoDB**.

The application allows administrators to create and manage elections and candidates, while registered voters can view eligible elections and securely cast their votes.

VoteX supports multiple elections, role-based authentication, location-based voter eligibility, one vote per election, live vote updates using Socket.IO, election results, winner declaration, and party logo uploads.

---

## 🌐 Live Demo

### Backend API

**Render:**  
https://votex-l726.onrender.com

> **Note:** The backend is hosted on Render's free tier. The server may take some time to wake up after a period of inactivity.

### Frontend

The React frontend can be run locally and connected to the deployed backend using the `VITE_API_URL` environment variable.

---

# ✨ Features

## 🔐 Authentication & Authorization

- User Registration & Login
- JWT Authentication
- Password Hashing using bcrypt
- Role-Based Access Control
  - Admin
  - Voter
- Protected API Routes
- Aadhaar-based voter login
- User profile management
- Password change
- Voter re-verification system

---

## 🗳️ Election Management

- Create elections
- Update elections
- Delete elections
- Multiple elections support
- Election start and end date validation
- Election status management
  - Upcoming
  - Active
  - Completed
- Manual election completion
- Election history
- Winner declaration

---

## 👤 Candidate Management

- Add candidates
- Update candidates
- Delete candidates
- Candidates linked to specific elections
- Party name normalization
- Duplicate candidate validation
- Party logo upload using Multer
- Images stored as Base64 in MongoDB

---

## 🧑‍🤝‍🧑 Voter Management

- Voter registration
- Voter login
- Active / inactive account status
- Voter profile
- Re-verification requests
- User deactivation and reactivation
- Permanent user blocking
- One vote per election

---

## 📍 Location-Based Voting Eligibility

VoteX supports location-based election eligibility.

Elections can be created at different levels:

- 🇮🇳 National
- 🏛️ State
- 📍 District

The voter's registered location is checked against the election location before allowing the voter to cast a vote.

---

## 📊 Voting System

- Secure vote casting
- JWT-protected voting
- One vote per election
- Duplicate voting prevention
- Election timing validation
- Live vote count updates
- Election results
- Winner declaration

---

## ⚡ Real-Time Vote Updates

VoteX uses **Socket.IO** to provide real-time vote count updates.

When a vote is successfully cast, connected clients can receive the updated vote count without manually refreshing the page.

---

## 🖼️ Party Logo Upload

Party logos are uploaded using **Multer with memoryStorage()**.

The uploaded image is converted to Base64 and stored directly in MongoDB.

This removes the need for separate server-side image storage.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Socket.IO Client
- HTML
- CSS

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Multer
- Socket.IO
- dotenv
- CORS

## Deployment

- Render
- MongoDB Atlas

---

# 📁 Project Structure

```text
VoteX/
│
├── .git/
├── .gitignore
├── LICENSE
├── README.md
│
├── VoteX Backend/
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   └── jwt.js
│   │
│   ├── models/
│   │   ├── candidate.js
│   │   ├── election.js
│   │   └── user.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── electionRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── utils/
│   │
│   ├── .env
│   ├── db.js
│   ├── liveTest.js
│   ├── package.json
│   ├── package-lock.json
│   ├── planning.txt
│   └── server.js
│
└── votex-frontend/
    ├── src/
    │   ├── api/
    │   │   ├── auth.js
    │   │   ├── candidates.js
    │   │   ├── client.js
    │   │   ├── elections.js
    │   │   └── endpoints.js
    │   │
    │   ├── components/
    │   │   ├── BallotSeal.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   │
    │   ├── pages/
    │   │   ├── AdminPanel.jsx
    │   │   ├── AdminSignup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ElectionDetail.jsx
    │   │   ├── ElectionHistory.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Results.jsx
    │   │
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

> `.env` and `node_modules` are excluded from Git using the root `.gitignore`.

---

# 📦 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Deepak-Bisht-19/VoteX.git
```

Navigate to the project:

```bash
cd VoteX
```

---

# ⚙️ Backend Setup

Open a terminal and navigate to the backend:

```bash
cd "VoteX Backend"
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `VoteX Backend` folder:

```env
PORT=3000
MONGODB_URL=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:3000
```

---

# 💻 Frontend Setup

Open another terminal.

From the `VoteX` root folder, navigate to the frontend:

```bash
cd votex-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `votex-frontend` folder:

```env
VITE_API_URL=http://localhost:3000
```

To connect the frontend to the deployed backend:

```env
VITE_API_URL=https://votex-l726.onrender.com
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔗 Frontend & Backend Communication

The React frontend communicates with the Express backend through REST APIs.

The backend URL is configured using:

```env
VITE_API_URL=http://localhost:3000
```

Axios is used for API requests, while Socket.IO Client is used for real-time vote updates.

---

# 🧪 API Testing

The backend REST APIs can be tested using:

- Postman
- Thunder Client
- Insomnia

### Local API

```text
http://localhost:3000
```

### Deployed API

```text
https://votex-l726.onrender.com
```

Some endpoints require JWT authentication.

After logging in, include the JWT token in the request header:

```text
Authorization: Bearer <your_jwt_token>
```

---

# 📡 API Modules

## User APIs

- Register User
- Login User
- Get Profile
- Update Profile
- Change Password
- Request Re-verification

## Admin APIs

- Create Admin
- View Re-verification Requests
- Approve Re-verification
- Permanently Block User
- Deactivate User
- Reactivate User

## Election APIs

- Create Election
- Update Election
- Delete Election
- View Elections
- View Election Details
- Complete Election
- View Election History

## Candidate APIs

- Add Candidate
- Update Candidate
- Delete Candidate
- Upload Party Logo
- View Candidates

## Voting APIs

- Cast Vote
- View Election Results
- View Winner

---

# 🔒 Security Features

VoteX implements several security mechanisms:

- JWT Authentication
- Password hashing using bcrypt
- Protected API routes
- Role-based authorization
- Admin-only election management
- Admin-only candidate management
- One vote per election
- Location-based voter eligibility
- Duplicate candidate prevention
- Election timing validation
- Active / inactive account control
- Permanent user blocking

---

# 🗳️ Voting Flow

```text
Voter Registration
        ↓
Voter Login
        ↓
View Elections
        ↓
Check Location Eligibility
        ↓
Open Election
        ↓
View Candidates
        ↓
Cast Vote
        ↓
Vote Count Updated
        ↓
Live Result Update
        ↓
Election Completed
        ↓
Winner Declared
```

---

# 📍 Election Eligibility

## National Election

The voter's country is checked against the election's country.

## State Election

The voter's state is checked against the election's state.

## District Election

The voter's state and district are checked against the election's location.

The backend performs these eligibility checks before accepting a vote.

---

# ⚡ Real-Time Voting Flow

```text
Voter
  ↓
Vote Request
  ↓
Express Backend
  ↓
MongoDB
  ↓
Vote Count Updated
  ↓
Socket.IO Event
  ↓
Connected Frontend Clients
  ↓
Live Vote Count
```

---

# 🖼️ Party Logo Storage

VoteX uses:

```text
Multer
   ↓
memoryStorage()
   ↓
Uploaded Image
   ↓
Base64 Conversion
   ↓
MongoDB
```

Party logos are stored directly in MongoDB as Base64 data.

---

# 🚀 Deployment

## Backend

The backend is deployed using **Render**.

```text
https://votex-l726.onrender.com
```

## Database

The application uses **MongoDB Atlas** for database hosting.

## Frontend

The React frontend can be deployed separately using platforms such as:

- Render
- Vercel
- Netlify

When deploying the frontend, configure:

```env
VITE_API_URL=https://votex-l726.onrender.com
```

---

# 🔮 Future Improvements

- Email verification
- Forgot password functionality
- OTP-based authentication
- Swagger API documentation
- Docker support
- Unit testing
- Integration testing
- Advanced admin analytics
- Election monitoring dashboard
- Cloud-based image storage
- Production-grade deployment improvements

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more details.

---

# 👨‍💻 Author

**Deepak Bisht**

### GitHub

https://github.com/Deepak-Bisht-19

### LinkedIn

https://www.linkedin.com/in/deepak-bisht19/

---

⭐ If you found this project useful, consider giving it a star on GitHub!