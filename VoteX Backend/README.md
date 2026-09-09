# 🗳️ VoteX - Online Election Management System

VoteX is a secure and scalable backend application built with **Node.js**, **Express.js**, and **MongoDB** for managing online elections. It enables administrators to create elections and manage candidates while allowing verified voters to cast votes securely. The system supports multiple elections, role-based authentication, location-based voter eligibility, live vote updates, and party logo uploads.

---

## 🌐 Live Demo

**Backend API:**  
https://votex-l726.onrender.com

> **Note:** This project is hosted on Render's free tier. The first request may take **30–60 seconds** to wake up the server after inactivity.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User Registration & Login
- JWT Authentication
- Password Hashing using bcrypt
- Role-Based Access Control (Admin & Voter)
- Protected API Routes

### 🗳️ Election Management
- Create, Update & Delete Elections
- Multiple Elections Support
- Election Start & End Date Validation
- Election Status Management

### 👤 Candidate Management
- Add, Update & Delete Candidates
- Candidate linked to a specific Election
- Party Name Normalization
- Party Logo Upload using Multer
- Images stored directly in MongoDB as Base64
- Duplicate Candidate Validation

### 🧑‍🤝‍🧑 Voter Management
- Register & Login Voters
- Active/Inactive Account Status
- One Vote Per Election
- Location-Based Voting Eligibility
  - National
  - State
  - District

### 📊 Voting System
- Secure Vote Casting
- Prevent Multiple Voting
- Live Vote Count using Socket.IO
- Election Results
- Winner Declaration

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- Multer (memoryStorage)
- Socket.IO
- dotenv
- Render

---

## 📁 Project Structure

```text
VoteX Backend
│
├── middleware/
│   ├── adminMiddleware.js
│   └── jwt.js
│
├── models/
│   ├── candidate.js
│   ├── election.js
│   └── user.js
│
├── routes/
│   ├── adminRoutes.js
│   ├── candidateRoutes.js
│   ├── electionRoutes.js
│   └── userRoutes.js
│
├── utils/
│
├── .env
├── .gitignore
├── db.js
├── LICENSE
├── liveTest.js
├── package.json
├── package-lock.json
├── planning.txt
├── README.md
└── server.js
```

---

## 📦 Installation

Clone the repository

```bash
git clone https://github.com/Deepak-Bisht-19/VoteX.git
```

Navigate to the project

```bash
cd VoteX
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=3000
MONGODB_URL=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
```

Run the application

```bash
npm start
```

or

```bash
npm run dev
```

---

## 🧪 API Testing

VoteX is a **backend-only REST API** and does not include a frontend interface.

You can test all endpoints using:

- Postman
- Thunder Client (VS Code)
- Insomnia

### Base URLs

**Local**

```text
http://localhost:3000
```

**Render**

```text
https://votex-1726.onrender.com
```

> Some endpoints require JWT Authentication.
> First log in to obtain a JWT token, then include it in the Authorization header:

```text
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Modules

### User APIs
- Register User
- Login User
- Get Profile
- Update Profile

### Election APIs
- Create Election
- Update Election
- Delete Election
- View Elections

### Candidate APIs
- Add Candidate
- Update Candidate
- Delete Candidate
- Upload Party Logo
- View Candidates

### Voting APIs
- Cast Vote
- View Election Results
- View Winner

---

## 🔒 Security Features

- JWT Authentication
- Password Encryption using bcrypt
- Admin-only Candidate & Election Management
- One Vote Per Election
- Duplicate Candidate Prevention
- Input Validation & Normalization
- Election Time Validation

---

## 🖼️ Party Logo Upload

VoteX uses **Multer memoryStorage()** for image uploads.

Party logos are converted into **Base64 format** and stored directly in MongoDB, eliminating the need for server-side image storage and making deployment easier.

---

## ⚡ Live Vote Updates

Vote counts are updated in real time using **Socket.IO**, allowing connected clients to receive instant vote updates without refreshing.

---

## 🚀 Deployment

- **Backend:** https://votex-1726.onrender.com
- **Database:** MongoDB Atlas

---

## 📌 Future Improvements

- React Frontend
- Admin Dashboard
- Email Verification
- Forgot Password
- Swagger API Documentation
- Docker Support
- Unit & Integration Testing

---

## 📄 License

This project is licensed under the **MIT License**. See the **LICENSE** file for more details.

---

## 👨‍💻 Author

**Deepak Bisht**

**GitHub:**  
https://github.com/Deepak-Bisht-19

**LinkedIn:**  
https://www.linkedin.com/in/deepak-bisht19/

---

⭐ If you found this project useful, consider giving it a star on GitHub!