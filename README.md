# 🅿️ SmartPark — Full Stack Smart Parking System

A production-ready Smart Parking System with real-time slot tracking, user authentication, booking management, and an admin dashboard.

**Stack:** Node.js + Express · MongoDB Atlas · Vanilla HTML/CSS/JS  
**Deploy:** Render (backend) + Vercel (frontend)

---

## 📁 Project Structure

```
smart-parking/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── ParkingSlot.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js           # POST /register, POST /login, GET /me
│   │   ├── slots.js          # CRUD slots + seeding
│   │   ├── bookings.js       # Booking + checkout + history
│   │   └── admin.js          # User management (admin only)
│   ├── server.js             # Express entry point
│   ├── render.yaml           # Render deploy config
│   └── .env.example          # Environment variable template
│
└── frontend/
    ├── index.html             # Landing + Login/Signup
    ├── vercel.json            # Vercel deploy config
    ├── pages/
    │   ├── dashboard.html     # User dashboard
    │   ├── slots.html         # Browse & book slots
    │   ├── my-bookings.html   # Booking history + receipt
    │   └── admin.html         # Admin panel
    └── public/
        ├── css/style.css      # Global design system
        └── js/
            ├── api.js         # All API calls + Auth helpers
            └── utils.js       # Toast, formatters, nav helpers
```

---

## ⚙️ LOCAL SETUP

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier) — https://cloud.mongodb.com
- Git

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-parking?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string_like_abc123xyz789
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Run backend:
```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs at: **http://localhost:5000**

### 3. Frontend setup
No build step needed! Open `frontend/index.html` in a browser, or use Live Server in VS Code.

If using Live Server (port 5500), update `api.js`:
```js
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://YOUR-BACKEND.onrender.com/api";
```

---

## 🌱 First-Time Setup (After Login)

1. Register an account and login
2. In MongoDB Atlas, manually set your user's role to `"admin"`:
   - Atlas → Collections → users → find your document → Edit → set `"role": "admin"`
3. Navigate to **Admin Panel → System Setup → Seed 30 Slots**
4. 30 slots are created across Ground, Floor 1, Floor 2

---

## 🚀 DEPLOYMENT

### Step 1: MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com → Create free cluster
2. Database Access → Add user (username + password)
3. Network Access → Add IP → `0.0.0.0/0` (allow all)
4. Connect → Drivers → Copy connection string
5. Replace `<password>` in the string with your DB password

### Step 2: Deploy Backend on Render
1. Push your `backend/` folder to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Environment Variables (add these):
   ```
   MONGO_URI       = mongodb+srv://... (your Atlas URI)
   JWT_SECRET      = your_secret_key_here
   NODE_ENV        = production
   CLIENT_URL      = https://YOUR-APP.vercel.app
   ```
6. Deploy → copy your Render URL (e.g. `https://smart-parking-api.onrender.com`)

### Step 3: Deploy Frontend on Vercel
1. Push your `frontend/` folder to GitHub (can be same repo or separate)
2. Open `frontend/public/js/api.js` and update:
   ```js
   : "https://smart-parking-api.onrender.com/api"; // your Render URL
   ```
3. Commit and push
4. Go to https://vercel.com → New Project → Import repo
5. Set Root Directory to `frontend/`
6. Deploy → copy your Vercel URL

### Step 4: Update CORS
In Render → Environment Variables, update:
```
CLIENT_URL = https://YOUR-APP.vercel.app
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET  | `/api/auth/me` | Get current user |

### Slots (public read, admin write)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/slots` | All slots |
| GET  | `/api/slots/available` | Available slots only |
| GET  | `/api/slots/stats` | Count by status |
| POST | `/api/slots` | Create slot (admin) |
| PUT  | `/api/slots/:id` | Update slot (admin) |
| DELETE | `/api/slots/:id` | Delete slot (admin) |
| POST | `/api/slots/seed` | Seed 30 slots (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET  | `/api/bookings/my` | My bookings |
| PUT  | `/api/bookings/:id/checkout` | Check out vehicle |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET  | `/api/bookings` | All bookings (admin) |
| GET  | `/api/bookings/stats` | Booking stats (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/users` | All users |
| PUT  | `/api/admin/users/:id/role` | Change role |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## 🎯 Features Built

- ✅ Real user authentication (JWT, bcrypt hashed passwords)
- ✅ Role-based access (user / admin)
- ✅ Real-time slot availability tracking
- ✅ Vehicle entry/exit logging with auto billing
- ✅ Booking management (walk-in + reservation)
- ✅ Parking receipt with duration & amount
- ✅ Admin dashboard: live map, stats, all bookings
- ✅ Admin: manage slots, users, force checkout
- ✅ Auto-refresh every 20–30 seconds
- ✅ Mobile responsive design
- ✅ DSA concepts: queue-style booking, hash-map slot lookup

---

## 🛠️ Tech Concepts Used

| Concept | Where Used |
|---------|-----------|
| **Arrays** | Slot grid rendering, booking history |
| **Queues** | Walk-in booking order (FIFO) |
| **Hashing** | bcryptjs password hashing |
| **DBMS** | MongoDB collections, relations (ref), aggregation |
| **REST API** | Express routes with JWT middleware |

---

## 📝 Notes

- Free Render instances sleep after 15 min of inactivity (first request ~30s delay on free tier)
- MongoDB Atlas free tier = 512MB storage, plenty for this project
- To make first admin: register → set role in Atlas manually once
