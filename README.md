#  VulnLab — Stage 1: IDOR Vulnerability Lab

A deliberately vulnerable web application built for learning and understanding 
Insecure Direct Object Reference (IDOR) — one of the most common and impactful 
web security vulnerabilities.

> ⚠️ This app is **intentionally insecure**. Run it only in a local or controlled 
> environment. Never deploy it publicly.

---

## What is this?

VulnLab is a hands-on security education lab. It simulates a real-world IDOR 
vulnerability in a simple e-commerce order system. You can see the vulnerability 
in action, understand why it happens, and see exactly how to fix it — all in one place.

This isn't a CTF challenge. It's a controlled learning environment designed to show 
the full lifecycle: exploit → impact → fix.

---

## The Vulnerability

IDOR (Insecure Direct Object Reference) happens when a server exposes internal 
object IDs (like database IDs) without checking if the requesting user actually 
owns that object.

In this app, the vulnerable route looks like this:
```javascript
// ❌ Vulnerable — no ownership check
app.get('/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.render('order', { order });
});
```

The fix is just one check:
```javascript
// ✅ Secure — ownership verified
if (order.user_id !== req.session.user_id) {
  return res.status(403).send('Forbidden');
}
```

---

## Setup & Installation

### Option 1 — Run with Node.js directly

Make sure you have Node.js installed, then:
```bash
git clone https://github.com/YOUR_USERNAME/VulnLab.git
cd VulnLab
npm install
npm run dev
```

Visit `http://localhost:3000`

### Option 2 — Run with Docker

Make sure Docker Desktop is running, then:
```bash
git clone https://github.com/YOUR_USERNAME/VulnLab.git
cd VulnLab
docker build -t vulnlab .
docker run -p 3000:3000 vulnlab
```

Visit `http://localhost:3000`

---

## Test Accounts

The database comes pre-seeded with two users:

| Username | Password |
|----------|----------|
| alice    | alice123 |
| bob      | bob123   |

---

## How to Exploit IDOR in this Lab

1. Login as `alice` / `alice123`
2. You'll see Alice's orders on the dashboard
3. Click any order — it opens at `/orders/1`
4. Manually change the URL to `/orders/4`
5. You're now viewing Bob's order even though you're logged in as Alice
6. The page will show a 🚨 banner explaining the data breach

---

## How to See the Fix

1. Go back to the dashboard
2. Click **🟢 Secure** on any order
3. Try changing the URL to `/secure/orders/4`
4. You'll get a **403 Forbidden** page — attack blocked!

---

## Project Structure
```
vulnlab/
├── db/
│   └── database.js        ← database connection & seed data
├── routes/
│   ├── auth.js            ← login, register, logout
│   └── orders.js          ← dashboard, vulnerable & secure routes
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── order.ejs
│   ├── forbidden.ejs
│   └── learn.ejs
├── public/
│   └── style.css
├── app.js
├── Dockerfile
└── README.md
```

---

## Tech Stack

- **Backend** — Node.js + Express.js
- **Database** — SQLite via better-sqlite3
- **Authentication** — express-session (session-based, no JWT)
- **Frontend** — EJS templates + vanilla CSS
- **Container** — Docker

---

## Learning Outcomes

After going through this lab you should understand:

- What IDOR is and why it happens
- The difference between authentication and authorization
- How sequential IDs make IDOR easier to exploit
- How one missing check can cause a full data breach
- How to properly implement object-level authorization

---

## What's Next — Stage 2 (Coming Soon)

- More vulnerability types
- Difficulty modes
- Scoreboard
- Real-world misconfiguration labs

---

## Ethical Disclaimer

This application is **intentionally vulnerable** and is designed strictly for 
educational purposes in controlled environments. Do not use techniques learned 
here against systems you don't own or have explicit permission to test.

The developer is not responsible for any misuse of this project.