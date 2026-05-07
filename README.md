# 🚗 Car Rental System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) based Car Rental Application that allows users to browse, book, and manage rental cars online. This project provides a modern user-friendly interface with secure authentication, car management, booking functionality, and location-based services.

---

# 📌 Features

## 👤 User Features
- User Registration & Login
- JWT Authentication & Authorization
- Browse Available Cars
- View Detailed Car Information
- Book Cars Online
- Location/GPS Detection
- Responsive UI Design
- Secure Protected Routes
- View Booking Details
- User Dashboard

## 🛠️ Admin Features
- Add New Cars
- Update Car Details
- Delete Cars
- Manage Bookings
- Manage Users
- Upload Car Images

---

# 🧰 Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS / CSS
- Context API

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- Multer

## Database
- MongoDB Atlas

---

# 📂 Project Structure

```bash
Car-Rental-System/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/sourajit09/car-rental-system.git
```

---

## 2️⃣ Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

# ▶️ Run the Project

## Start Backend

```bash
cd backend
npm run dev
```

## Start Frontend

```bash
cd frontend
npm start
```

---

# 🌍 API Endpoints

## Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |

## Car Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars` | Get All Cars |
| GET | `/api/cars/:id` | Get Single Car |
| POST | `/api/cars` | Add Car |
| PUT | `/api/cars/:id` | Update Car |
| DELETE | `/api/cars/:id` | Delete Car |

## Booking Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create Booking |
| GET | `/api/bookings` | Get User Bookings |

---

# 🔒 Authentication

This project uses JWT (JSON Web Token) authentication for secure login and protected routes.

Example:

```js
jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
)
```

---

# 📸 Screenshots

Add your project screenshots here.

```md
![Home Page](./screenshots/home.png)
![Cars Page](./screenshots/cars.png)
![Booking Page](./screenshots/booking.png)
```

---

# 🚀 Future Improvements

- Online Payment Gateway
- Real-time Car Availability
- Email Verification
- Forgot Password Feature
- Booking Cancellation
- Review & Rating System
- Admin Analytics Dashboard

---

# 🧠 Learning Outcomes

Through this project, I learned:

- Full Stack MERN Development
- REST API Development
- JWT Authentication
- MongoDB Database Design
- Protected Routes
- State Management
- File Upload Handling
- API Integration

---

---

# 📜 License

This project is developed for learning and educational purposes.

---

