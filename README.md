```markdown
# Crossed Hearts — Project Setup & Commands Guide

---

## Project Structure

```
CrossedHearts-RawCode/
│
├── Crossed Hearts Bckend/       ← Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   └── index.js             ← Entry point
│   ├── .env
│   ├── package.json
│   ├── uploads/
│   └── crossed-hearts/
│
└── (Frontend files)
```

---

## Requirements

Before you start, make sure you have:

- [Node.js](https://nodejs.org) installed (v18 or higher recommended)
- Internet connection (for MongoDB Atlas)

---

## 1. Start the Backend

Every time you want to use the site, you must start the backend first.

### Open Terminal and run:

```bash

cd "D:\SourceCode\winterberry\crossedhearts\CrossedHearts_Rawcode\CrossedHearts-RawCode\Crossed Hearts Bckend"
```

### Install dependencies (first time only):

```bash
npm install
```

### Start the server:

```bash
npm start
```

### You should see:

```
🚀 Crossed Hearts API running on port 5000
✅ MongoDB connected
```

> ⚠️ Keep this terminal open while using the site. Closing it stops the backend.

---

## 2. Start the Frontend

The frontend is plain HTML — no installation needed.

- Open **VS Code** in the frontend folder
- Right-click `index.html` → **Open with Live Server**
- Or just double-click `index.html` to open in browser

> Your frontend runs at: `http://127.0.0.1:5502/index.html`

---

## 3. Test the Backend is Running

Open your browser and go to:

```
http://localhost:5000
```

You should see: **Backend Running**

---

## 4. API Endpoints

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Create a new user account   |
| POST   | `/api/auth/login`    | Login with email & password |

---

## 5. View Stored Users in MongoDB

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Login with the MongoDB account
3. Click your **Cluster**
4. Click **Browse Collections**
5. Open the **users** collection to see all registered users

---

## 6. Every Time You Restart Your PC

Run these commands to start the backend again:

```bash
cd "D:\SourceCode\winterberry\crossedhearts\CrossedHearts_Rawcode\CrossedHearts-RawCode\Crossed Hearts Bckend"
npm start
```

Then open `index.html` in your browser.

---

## 7. Common Errors & Fixes

| Error | Fix |
| ----- | --- |
| `Cannot connect to server` | Backend is not running — run `npm start` |
| `Cannot find module 'server.js'` | Entry point is `src/index.js` — always use `npm start`, not `node server.js` |
| `Port 5000 already in use` | Run `netstat -ano \| findstr :5000` then `taskkill /PID <number> /F` |
| `MongoDB not connected` | Check your `.env` file has the correct `MONGO_URI` |
| `bad auth: authentication failed` | Wrong MongoDB credentials in `.env` — reset password on Atlas and update `MONGO_URI` |
| `npm install` fails | Make sure you are inside the backend folder (not frontend) |
| CORS error in browser | Make sure the backend `FRONTEND_URL` allowlist includes your trusted frontend origin |

---

## 8. Environment Variables (.env)

Located at: `Crossed Hearts Bckend/.env`

Keep backend secrets only in the backend `.env` file or production host environment variables. Do not put MongoDB URIs, JWT secrets, email API keys, Stripe secret keys, Razorpay secrets, or object-storage credentials in frontend files.

> ⚠️ Never share your `.env` file publicly — it contains your database credentials.

---

## 9. Quick Reference — All Commands

```bash
# Navigate to backend folder
cd "D:\SourceCode\winterberry\crossedhearts\CrossedHearts_Rawcode\CrossedHearts-RawCode\Crossed Hearts Bckend"

# Install packages (first time only)
npm install

# Start backend server
npm start

# Stop backend server
Ctrl + C

# Check what is running on port 5000 (if port conflict)
netstat -ano | findstr :5000

# Kill process on port 5000 (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

---

_Crossed Hearts — Backend Integration Guide_
```
