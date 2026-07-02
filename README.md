# 🔗 URL Shortener Backend

A production-ready RESTful URL Shortener API built with **Node.js**, **Express.js**, **MongoDB**, and **Redis**. The application enables users to securely create, manage, and analyze shortened URLs while following backend best practices for authentication, caching, security, and deployment.

---

# 🌐 Live API

**Base URL**

```text
https://url-shortner-backend-icn0.onrender.com
```

> **Note:** Hosted on Render's free tier. The first request after inactivity may take **30–60 seconds** while the service wakes up.

---

# ✨ Features

## 🔐 Authentication

- User Registration & Login
- JWT Authentication (Access & Refresh Tokens)
- Secure HTTP-only Cookies
- Refresh Access Token
- Logout
- Get Current User
- Update Profile
- Change Password
- Profile Image Upload

## 🔗 URL Management

- Create Short URLs
- Custom Short Codes
- URL Expiration
- Redirect to Original URL
- Activate / Deactivate URLs
- Delete URLs
- Personal URL Dashboard

## 📊 Analytics

- Click Tracking
- Browser Analytics
- Operating System Analytics
- Device Analytics
- Referrer Tracking
- IP Tracking
- Country & City Analytics
- URL Statistics Dashboard

## ⚡ Performance

- Redis Caching
- Cache Expiration (TTL)
- Cache Invalidation

## 🛡 Security

- Helmet
- Rate Limiting
- Password Hashing (bcrypt)
- Global Error Handling
- CORS
- Trust Proxy Support

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Cache | Upstash Redis |
| Authentication | JWT, bcrypt |
| File Upload | Multer |
| Media Storage | Cloudinary |
| Security | Helmet, express-rate-limit |
| Analytics | UAParser.js, IPinfo API |
| Deployment | Render |

---

# 🔧 Services Used

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud-hosted MongoDB database |
| **Upstash Redis** | Redis caching and TTL management |
| **Cloudinary** | Cloud image storage and optimization |
| **IPinfo API** | Country & City detection from IP address |
| **Render** | Backend deployment and hosting |

### Official Resources

- MongoDB Atlas → https://www.mongodb.com/atlas
- Upstash Redis → https://upstash.com
- Cloudinary → https://cloudinary.com
- IPinfo → https://ipinfo.io
- Render → https://render.com

---

# 📂 Project Structure

```text
src/
├── config/         # Configuration (Redis, Cloudinary)
├── controllers/    # Business logic
├── db/             # Database connection
├── middlewares/    # Authentication & Security
├── models/         # Database schemas
├── routes/         # API routes
├── utils/          # Helper functions
├── app.js          # Express configuration
└── index.js        # Application entry point
```

---

# 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/karankumar1106/url-shortner-backend.git

cd url-shortner-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file using `.env.example`.

### 4. Start the Development Server

```bash
npm run dev
```

Server runs on

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

```env
PORT=3000

NODE_ENV=development

CORS_ORIGIN=http://localhost:5173

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL=

IPINFO_TOKEN=
```

---

# 📡 API Endpoints

## 🔐 Authentication

| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/users/register` |
| POST | `/api/v1/users/login` |
| POST | `/api/v1/users/logout` |
| POST | `/api/v1/users/refresh-token` |
| GET | `/api/v1/users/me` |
| PATCH | `/api/v1/users/update-account` |
| PATCH | `/api/v1/users/change-password` |
| PATCH | `/api/v1/users/profile-image` |

---

## 🔗 URL Management

| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/urls` |
| GET | `/api/v1/urls/my-urls` |
| GET | `/api/v1/urls/:shortCode/stats` |
| DELETE | `/api/v1/urls/:shortCode/delete` |

---

## 📊 Analytics

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/analytics/:shortCode` |
| GET | `/api/v1/dashboard` |

---

## 🔄 Redirect

| Method | Endpoint |
|--------|----------|
| GET | `/:shortCode` |

---

## ❤️ Health Check

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/healthcheck` |

---

# 🏗 System Architecture

```text
                    Client
                       │
                       ▼
                Express Server
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 MongoDB Atlas   Upstash Redis   Cloudinary
        │
        ▼
 Analytics (IPinfo API)
```

---

# 📌 Project Highlights

- RESTful API Architecture
- Production Deployment on Render
- JWT Authentication with HTTP-only Cookies
- MongoDB Atlas Cloud Database
- Redis Caching using Upstash
- Cloudinary Image Storage
- URL Analytics (Browser, OS, Device, Country & City)
- Helmet, Rate Limiting & Global Error Handling
- Clean MVC Architecture

---

# 🚀 Future Improvements

- Email Verification
- Password Reset
- QR Code Generation
- Custom Domains
- Swagger / OpenAPI Documentation
- Docker Support
- Advanced Analytics Dashboard

---

