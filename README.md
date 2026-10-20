# 🍽️ FoodOrder — Gourmet Food Ordering System

> A full-stack food ordering web application with a modern customer-facing storefront and a powerful admin panel.

## 📸 Screenshots

### 🏠 Home Page
![Home](./screenshots/Home.png)

### 🍕 Menu / Foods Page
![Foods](./screenshots/Menu.png)

---

## ✨ Features

### 👤 Customer
- Browse gourmet menu with category & search filters
- Add items to cart and place orders
- Real-time order tracking and order history
- View digital payment receipts (PDF)
- Submit feedback and ratings
- Manage personal profile

### 🛡️ Admin Panel
- Dashboard with sales analytics & charts
- Manage food categories and menu items
- Process and update order statuses
- View payments and generate reports
- Manage customer accounts
- Read and respond to customer feedback

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| React Router DOM | Client-side Routing |
| Lucide React | Icon Library |
| Axios | HTTP Client |
| Tailwind CSS 4 + CSS | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| PDFKit | Receipt Generation |

---

## 📁 Project Structure

```
food-ordering-system/
├── backend/
│   ├── config/          # DB & env config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── app.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/  # Reusable UI components
        │   ├── admin/
        │   ├── common/  # Navbar, Footer
        │   └── ui/
        ├── context/     # Auth & Cart context
        ├── layouts/     # Customer & Admin layouts
        ├── pages/
        │   ├── admin/   # Dashboard, Orders, etc.
        │   ├── auth/    # Login, Register
        │   └── customer/# Home, Foods, Cart, etc.
        ├── routes/      # AppRoutes, ProtectedRoute
        └── services/    # Axios API service
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20.19+ or v22.12+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/AYUSH12-byte/Food-Ordering-System.git
cd food-ordering-system
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside `/backend`:

```env
PORT=7000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

The frontend defaults to `http://localhost:7000/api`. If you change the backend
port, update `VITE_API_URL` in `/frontend/.env` to match.

---

## 📌 API Routes Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register user |
| GET | `/api/foods` | Get all foods |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/admin/dashboard` | Admin stats |

---

## 👨‍💻 Author

**Ayush Chaudhari**

[![GitHub](https://img.shields.io/badge/GitHub-AYUSH12--byte-181717?style=flat&logo=github)](https://github.com/AYUSH12-byte)

---

## 📄 License

This project is for educational purposes.

---

<p align="center">Crafted with ❤️ for delicious food lovers</p>
