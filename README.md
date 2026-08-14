# 🏦 BANK_LEDGER

A production-grade backend application for **Bank Ledger**, built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, **BcryptJS**, and **Nodemailer** with OAuth2 integration.

---

## 🚀 Features

- **Production-Level Layered Architecture**: Clean separation of concerns with `controllers`, `services`, `models`, `routes`, `middleware`, and `config`.
- **User Authentication**:
  - **Registration (`POST /api/auth/register`)**: User registration with input validation, duplicate email checks, password hashing, JWT generation, and HTTP cookie placement.
  - **Login (`POST /api/auth/login`)**: Secure authentication via email/password, matching hashed passwords via schema instance methods.
- **Authentication Middleware (`authMiddleware`)**:
  - Centralized route protection middleware verifying JWT tokens extracted from HTTP cookies or the `Authorization` header (`Bearer <token>`).
  - Attaches the verified `User` object directly to `req.user` for protected downstream handlers.
- **Account Management & Ledger Base**:
  - **Create Account (`POST /api/account/createAccount`)**: Secure route allowing authenticated users to create bank accounts.
  - Accounts linked directly to `User` ObjectId with customizable currency (`INR` default) and status control (`ACTIVE`, `FROZEN`, `CLOSED`).
  - Optimized database indexing (including single & composite indexes) to handle high-concurrency parallel queries efficiently.
- **Security & Data Protection**:
  - Automatic password hashing before saving users via Mongoose `pre('save')` hook using `bcryptjs`.
  - Hidden password field by default (`select: false`) in Mongoose schema to prevent leakages.
  - Token-based stateless authentication with `jsonwebtoken` stored in browser cookies via `cookie-parser`.
- **Automated Email Service**:
  - Integrated **Nodemailer** using **OAuth2** authentication with Gmail.
  - Asynchronous HTML welcome emails (`sendRegistrationEmail`) sent automatically upon user registration.
- **Database Connection**:
  - Robust MongoDB connection with Mongoose and DNS fallback mechanism (`dns.setServers`).

---

## 🛠️ Tech Stack & Dependencies

| Package | Version | Description |
| :--- | :--- | :--- |
| **[Express.js](https://expressjs.com/)** | `^5.2.1` | Web framework for routing and middleware handling |
| **[Mongoose](https://mongoosejs.com/)** | `^9.9.2` | MongoDB Object Data Modeling (ODM) library |
| **[JSONWebToken](https://jwt.io/)** | `^9.0.3` | User session token generation and verification |
| **[BcryptJS](https://github.com/dcodeIO/bcrypt.js)** | `^3.0.3` | Secure password hashing & comparison |
| **[Cookie-Parser](https://github.com/expressjs/cookie-parser)** | `^1.4.7` | Parse HTTP request cookies |
| **[Nodemailer](https://nodemailer.com/)** | `^9.0.5` | Email sending module configured with OAuth2 |
| **[Dotenv](https://github.com/motdotla/dotenv)** | `^17.4.2` | Environment configuration manager |

---

## 📂 Project Structure

```
BANK_LEDGER/
├── BACKEND/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Database connection configuration & DNS resolver
│   │   ├── controllers/
│   │   │   ├── account.controller.js # Bank account creation & management handlers
│   │   │   └── auth.controller.js  # Controller handling registration & login logic
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT authentication & route protection middleware
│   │   ├── models/
│   │   │   ├── account.model.js    # Bank account Mongoose schema & indexing
│   │   │   └── user.model.js       # User Mongoose schema, hooks & comparison methods
│   │   ├── routes/
│   │   │   ├── account.routes.js   # Account API endpoints router
│   │   │   └── auth.routes.js      # Auth API endpoints router
│   │   ├── services/
│   │   │   └── email.service.js    # Nodemailer transporter & email templates
│   │   └── app.js                  # Express App configuration & route bindings
│   ├── .env                        # Environment variables file (Git ignored)
│   ├── package.json                # Project dependencies & npm scripts
│   └── server.js                   # Application entry point & server listener
├── FRONTEND/                       # Frontend client application directory
├── .gitignore                      # Git ignore patterns (node_modules, .env)
└── README.md                       # Project documentation
```

---

## 📡 API Endpoints Summary

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user | `{ "name", "email", "password" }` | User details, JWT token, HTTP cookie, welcome email sent |
| `POST` | `/api/auth/login` | Public | Authenticate existing user | `{ "email", "password" }` | User details, JWT token, HTTP cookie |

### Account Routes (`/api/account`)

| Method | Endpoint | Access | Description | Headers / Cookies | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/account/createAccount` | 🔒 Protected | Create a new bank account | `Authorization: Bearer <token>` or `cookie: token` | Account object created with user reference |

---

## ⚙️ Environment Variables

Create a `.env` file inside the `BACKEND` directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bank_ledger
JWT_SECRET=your_jwt_secret_key

# Nodemailer OAuth2 Setup
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

---

## 🏁 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SoumyaSudhirNayak/BANK_LEDGER.git
   cd BANK_LEDGER/BACKEND
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in `BACKEND/` as shown above.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

---

## 👤 Author

**Soumya Sudhir Nayak**
- GitHub: [@SoumyaSudhirNayak](https://github.com/SoumyaSudhirNayak)
