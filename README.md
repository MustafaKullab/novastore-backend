# NovaStore — Backend API

RESTful backend for **NovaStore**, a full-stack e-commerce platform. Built with Node.js, Express, and MongoDB, providing authentication, product/category management, cart & checkout, order tracking, and an admin dashboard API.

> 🔗 Frontend repository: [novastore-frontend](https://github.com/MustafaKullab/novastore-frontend)

---

## Features

- **Authentication** — JWT-based auth with short-lived access tokens + refresh tokens stored in `httpOnly` cookies, email verification via one-time codes, password reset flow
- **Role-based accounts** — `user` and `admin` roles with dedicated middleware guards
- **Product & category management** — full CRUD with image upload (Multer), stock tracking, low-stock/out-of-stock reporting
- **Cart & checkout** — add/remove/update items, stock validation, order creation from cart
- **Order management** — order history per user, status updates (pending → processing → shipped → delivered), admin-wide order view
- **Contact system** — customer messages with read/unread state and admin reply-by-email
- **Admin dashboard endpoints** — totals for products, orders, users, revenue, and recent activity
- **Security middleware** — Helmet, CORS, rate limiting, input validation/sanitization (`express-validator`), bcrypt password hashing

## Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Runtime        | Node.js                                       |
| Framework      | Express 5                                     |
| Database       | MongoDB with Mongoose                         |
| Auth           | JSON Web Tokens (jsonwebtoken), bcrypt        |
| File Uploads   | Multer                                        |
| Email          | Nodemailer (SMTP)                             |
| Validation     | express-validator, validator                  |
| Security       | Helmet, CORS, express-rate-limit              |

## Project Structure

```
Backend store/
├── controllers/       # Route handler logic
├── middleware/         # Auth guards, error handler, upload config
├── models/              # Mongoose schemas (User, Product, Category, Cart, Order, Contact)
├── routes/                # API route definitions
├── utils/                   # Helper utilities (email sender)
├── public/uploads/           # Uploaded product/category images
├── app.js                       # Express app configuration
└── server.js                     # Entry point — DB connection + server start
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB instance (local or MongoDB Atlas)
- An SMTP-capable email account (e.g. Gmail with an app password) for verification/reset emails

### Installation

```bash
git clone https://github.com/MustafaKullab/novastore-backend.git
cd novastore-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

> ⚠️ Never commit `.env` — it's already covered by `.gitignore`.

### Run the server

```bash
npm run dev
```

The API will be available at `http://localhost:PORT` (default `7000`), and expects the frontend to run at `http://localhost:5173` (configured in CORS).

## API Overview

| Area          | Example Endpoints                                                         |
|---------------|------------------------------------------------------------------------------|
| Auth          | `POST /signup`, `POST /login`, `POST /verify`, `POST /refresh`, `POST /logout` |
| Users         | `GET /getUser`, `PATCH /changeUsername`, `DELETE /deleteUser/:userId`         |
| Products      | `GET /products`, `POST /addProduct`, `PUT /editProduct/:productId`             |
| Categories    | `GET /allCategories`, `POST /addCategory`, `DELETE /deleteCategory/:categoryId` |
| Cart          | `POST /addToCart`, `POST /rmvFromCart`, `GET /cart`                             |
| Orders        | `POST /confOrder`, `GET /allOrders`, `PATCH /updateStatucOfOrder`               |
| Contact       | `POST /contactMessage`, `GET /getMessages`, `POST /sendReply/:messageId`        |
| Dashboard     | `GET /totalProducts`, `GET /totalOrders`, `GET /revenue`                        |

All state-changing and privileged routes are protected with `authUser` / `authAdmin` middleware.

## Roadmap / Planned Improvements

- Tighten role-based access control across all admin-only endpoints
- Add ownership checks on order-lookup endpoints
- Move guest cart handling to client-side storage with merge-on-login
- Add automated tests (Jest/Supertest)

## Author

**Mustafa Kullab** — University web application development coursework project.
