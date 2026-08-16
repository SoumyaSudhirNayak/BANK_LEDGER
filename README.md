# 🏦 BANK_LEDGER

A production-grade backend application for **Bank Ledger**, built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, **BcryptJS**, **Immutable Double-Entry Accounting**, and **Nodemailer** with OAuth2 integration.

---

## 🚀 Features

- **Production-Level Layered Architecture**: Clean separation of concerns across `controllers`, `services`, `models`, `routes`, `middleware`, and `config`.
- **User Authentication & System Roles**:
  - **Registration (`POST /api/auth/register`)**: User registration with input validation, duplicate email checks, automatic password hashing, JWT generation, HTTP-only cookie assignment, and welcome email dispatch.
  - **Login (`POST /api/auth/login`)**: Secure authentication via email/password utilizing schema instance methods (`comparePassword`).
  - **System User Role (`systemuser`)**: Flag in User schema (`select: false` by default) for high-privilege system operations.
- **Granular Authentication Middlewares (`auth.middleware.js`)**:
  - **`authMiddleware`**: Protects standard user endpoints by verifying JWT tokens from cookies (`req.cookies.token`) or `Authorization: Bearer <token>` headers and attaching `req.user`.
  - **`authSystemUserMiddleware`**: Ensures endpoints (such as initial funds seeding) can only be accessed by authenticated system users.
- **Account Management & Balance Calculation (`account.model.js` & `account.controller.js`)**:
  - **Create Account (`POST /api/account/createAccount`)**: Allows authenticated users to create bank accounts linked to their `userId`.
  - **Get User Accounts (`GET /api/account/getAccounts`)**: Fetches all bank accounts owned by the logged-in user.
  - **Get Account Balance (`GET /api/account/getAccountBalance/:accountId`)**: Calculates real-time account balance directly from ledger entries using MongoDB Aggregation (`totalCredit - totalDebit`).
  - Status management (`ACTIVE`, `FROZEN`, `CLOSED`) and default currency (`INR`).
  - Optimized database query indexing (including composite index `{ userId: 1, status: 1 }`).
- **Immutable Double-Entry Ledger System (`ledger.model.js`)**:
  - Double-entry bookkeeping model creating matching `DEBIT` and `CREDIT` records for financial integrity.
  - **Strict Immutability Guard**: Pre-hooks on all update and deletion Mongoose operations (`updateOne`, `updateMany`, `findOneAndUpdate`, `deleteOne`, `deleteMany`, `remove`, `findOneAndDelete`, `findOneAndReplace`) that throw an error if ledger alteration is attempted, guaranteeing an append-only audit trail.
- **Transaction Processing & Authorization (`transaction.model.js` & `transaction.controller.js`)**:
  - **Strict Account Ownership Authorization**: Validates that `fromAccount` matches `req.user._id` (`HTTP 403 Forbidden` returned if a user attempts to initiate a transfer from an account they do not own).
  - **10-Step Transfer Flow (`POST /api/transactions/`)**:
    1. Validate request body parameters (`fromAccount`, `toAccount`, `amount`, `idempotencyKey`).
    2. Check idempotency key state to prevent duplicate operations (`COMPLETED`, `FAILED`, `PENDING`, `REVERSED`).
    3. Enforce account ownership (`fromAccount === req.user._id`).
    4. Validate sender & recipient account status (`ACTIVE`).
    5. Derive sender balance from ledger to verify sufficient funds.
    6. Create transaction record with status `PENDING`.
    7. Create `DEBIT` entry in immutable ledger.
    8. Create `CREDIT` entry in immutable ledger.
    9. Mark transaction status `COMPLETED`.
    10. Commit MongoDB session transaction.
    11. Resolve recipient user details (`toUser.name`) and dispatch email receipt.
  - **System Initial Funds Seeding (`POST /api/transactions/system/intial-funds`)**: Executed using **MongoDB ACID Transactions (`startSession`, `startTransaction`)** to atomically create initial credit ledger entries.
- **Security & Data Protection**:
  - Automatic password hashing via Mongoose `pre('save')` hooks with `bcryptjs`.
  - Strict user ownership checks on transaction creation (`403 Forbidden` protection).
  - Hidden password & system user flags by default (`select: false`).
- **Automated Email Service (`email.service.js`)**:
  - Nodemailer service integrated with Gmail OAuth2 (`CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`).
  - Automatically resolves recipient name (`toUser.name`) from DB for personalized receipt delivery following completed transactions.

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
│   │   │   └── db.js                      # Database connection setup & DNS resolver
│   │   ├── controllers/
│   │   │   ├── account.controller.js      # Account creation, list & balance calculation handlers
│   │   │   ├── auth.controller.js         # User registration & login logic
│   │   │   └── transaction.controller.js  # 10-Step transaction flow & initial funds seeding
│   │   ├── middleware/
│   │   │   └── auth.middleware.js         # User & System user JWT auth middlewares
│   │   ├── models/
│   │   │   ├── account.model.js          # Bank account schema, balance aggregation & indexing
│   │   │   ├── ledger.model.js           # Immutable double-entry ledger schema & immutability guards
│   │   │   ├── transaction.model.js      # Transaction schema with idempotency key
│   │   │   └── user.model.js             # User schema, bcrypt hooks & systemuser flag
│   │   ├── routes/
│   │   │   ├── account.routes.js          # Account API endpoints router
│   │   │   ├── auth.routes.js             # Auth API endpoints router
│   │   │   └── transaction.routes.js     # Transaction API endpoints router
│   │   ├── services/
│   │   │   └── email.service.js           # Nodemailer transporter & email templates
│   │   └── app.js                         # Express application setup & route bindings
│   ├── .env                               # Environment variables file (Git ignored)
│   ├── package.json                       # Project dependencies & npm scripts
│   └── server.js                          # Application entry point & server listener
├── FRONTEND/                              # Client frontend directory
├── .gitignore                             # Git ignore rules (node_modules, .env)
└── README.md                              # Repository documentation
```

---

## 📡 API Endpoints Summary

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user | `{ "name", "email", "password" }` | User details, JWT token, cookie, welcome email |
| `POST` | `/api/auth/login` | Public | Authenticate existing user | `{ "email", "password" }` | User details, JWT token, cookie |

### Account Routes (`/api/account`)

| Method | Endpoint | Access | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/account/createAccount` | 🔒 User Auth | Create a new bank account | Header token or Cookie | Created Account object |
| `GET` | `/api/account/getAccounts` | 🔒 User Auth | Fetch all accounts for user | Header token or Cookie | List of user accounts |
| `GET` | `/api/account/getAccountBalance/:accountId` | 🔒 User Auth | Fetch real-time account balance | URL Param: `accountId` | Account ID & calculated balance |

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Access | Description | Request Body / Headers | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/` | 🔒 User Auth | Execute 10-step transfer transaction | `{ "fromAccount", "toAccount", "amount", "idempotencyKey" }` | Transaction details & email alert |
| `POST` | `/api/transactions/system/intial-funds` | 🔒 System Auth | Seed initial funds into an account | `{ "toAccount", "amount", "idempotencyKey" }` | Completed transaction details |

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

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 👤 Author

**Soumya Sudhir Nayak**
- GitHub: [@SoumyaSudhirNayak](https://github.com/SoumyaSudhirNayak)
