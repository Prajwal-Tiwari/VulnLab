# VulnLab — IDOR Vulnerability Lab

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Web_Framework-lightgrey)
![Security Lab](https://img.shields.io/badge/Web_Security-IDOR_Lab-red)
![License](https://img.shields.io/badge/License-MIT-blue)

A deliberately vulnerable web application built to learn and understand Insecure Direct Object Reference (IDOR) — one of the most common and impactful web security vulnerabilities found in real-world applications.

> This application is intentionally insecure. Run it only in a local or controlled environment. Never deploy it publicly.

Current Version: **v2.0**

---

## What is VulnLab?

VulnLab is a hands-on security lab that simulates a simple e-commerce order system with a real IDOR vulnerability built in. The goal is not just to show that the vulnerability exists, but to walk through the full lifecycle — from exploiting it, understanding why it works, to seeing the correct fix implemented.

This is not a CTF challenge. There are no scores or timers. It is a controlled environment meant for learning.

---

## The Vulnerability

IDOR happens when a server exposes internal object identifiers — like database IDs — without checking whether the person requesting the resource actually owns it.

The vulnerable version:
```javascript
// No ownership check — anyone can access any order
app.get('/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.render('order', { order });
});
```

The correct version:
```javascript
// Ownership verified before returning data
if (order.user_id !== req.session.user_id) {
  return res.status(403).send('Forbidden');
}
```

One missing check. That is all it takes for a full data breach.

---

## Difficulty Levels

VulnLab v2.0 adds a structured difficulty system inspired by DVWA.

**Low**
Orders are accessed via plain sequential integer IDs with no ownership check. The most basic form of IDOR — just change the number in the URL and you can access anyone's data.

**Medium**
Orders are accessed via Base64 encoded IDs. The ID looks obscure but Base64 is not encryption — anyone can decode it in a browser console using `atob()`. The vulnerability is still fully exploitable. This level teaches why hiding data is not the same as securing it.

**High**
Orders use unpredictable UUIDs and the server verifies ownership before returning any data. Even if you somehow get a valid UUID, the server-side check blocks unauthorized access. This is the correct implementation.

You can switch difficulty levels anytime from the Settings page inside the app.

---

## Prerequisites

### Node.js (Required)

VulnLab runs on Node.js. Install it before anything else.

1. Go to https://nodejs.org
2. Download the LTS version
3. Run the installer — make sure to check "Add to PATH" during installation

Verify the installation by opening a fresh terminal and running:
```cmd
node -v
npm -v
```

You should see version numbers. If you see `npm is not recognized`, Node.js was either not installed correctly or not added to PATH. Reinstall and check that option. Always open a fresh terminal after installing — old terminals will not pick up the new installation.

### Git (Required)

1. Go to https://git-scm.com/downloads
2. Download and install for your OS
3. Verify: `git --version`

### Docker (Optional)

Only needed if you want to run VulnLab inside a container.

1. Go to https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for your OS
3. Verify after installing: `docker --version`

### SQLite (No Installation Needed)

VulnLab uses SQLite via the `better-sqlite3` package. It installs automatically when you run `npm install`. The database file is also created and seeded on first run — you will see this in the terminal:
```
Database seeded with users and orders
```

If you want to visually inspect the database, DB Browser for SQLite is a good free tool: https://sqlitebrowser.org/dl — not required to run the app though.

### Windows PowerShell (Windows Only)

If you get a scripts execution error in PowerShell, run this once:
```cmd
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Port 3000

VulnLab runs on port 3000 by default. If something else is already using that port, the app will not start. Check with:
```cmd
netstat -ano | findstr :3000
```

If it is taken, change the `PORT` value in `app.js` to something else like `3001`.

---

## Setup and Installation

**Option 1 — Node.js**
```bash
git clone https://github.com/Prajwal-Tiwari/VulnLab.git
cd VulnLab
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

**Option 2 — Docker**

Make sure Docker Desktop is running first.
```bash
git clone https://github.com/Prajwal-Tiwari/VulnLab.git
cd VulnLab
docker build -t vulnlab .
docker run -p 3000:3000 vulnlab
```

Then open `http://localhost:3000` in your browser.

---

## Test Accounts

The database is pre-seeded with two users:

| Username | Password |
|----------|----------|
| alice    | alice123 |
| bob      | bob123   |

---

## How to Test the Vulnerability

**Low difficulty**

1. Login as alice / alice123
2. Open any order from the dashboard — it loads at `/orders/1`
3. Change the URL to `/orders/4`
4. You are now viewing Bob's order while logged in as Alice

**Medium difficulty**

1. Switch to Medium in Settings
2. Dashboard links will look like `/orders/MQ==`
3. Open your browser console and run `atob('MQ==')` — it returns `1`
4. Encode Bob's order ID: `btoa('4')` returns `NA==`
5. Visit `/orders/NA==` — still exposed

**High difficulty**

1. Switch to High in Settings
2. Dashboard links use UUIDs
3. Try modifying the UUID in the URL
4. Server returns 403 Forbidden

---

## Project Structure
```
vulnlab/
├── db/
│   └── database.js        
├── routes/
│   ├── auth.js            
│   └── orders.js          
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── order.ejs
│   ├── forbidden.ejs
│   ├── settings.ejs       
│   └── learn.ejs
├── public/
│   └── style.css
├── app.js
├── Dockerfile
├── CHANGELOG.md
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | SQLite via better-sqlite3 |
| Authentication | express-session |
| Frontend | EJS + Vanilla CSS |
| Container | Docker |

---

## What You Will Learn

- What IDOR is and why it happens
- The difference between authentication and authorization
- Why predictable sequential IDs are a security risk
- Why obscuring data is not the same as securing it
- How UUIDs reduce the attack surface
- How to implement proper object-level authorization

---

## Roadmap

| Stage | Status | Focus |
|-------|--------|-------|
| Stage 1 | Complete | IDOR vulnerability lab |
| Stage 2 | Complete | Difficulty system |
| Stage 3 | Planned | XSS vulnerability lab |
| Stage 4 | Planned | CSRF vulnerability lab |
| Stage 5 | Planned | API authorization flaws |

---

## Contributing

Contributions are welcome. You can help by adding new vulnerability labs, improving explanations, writing documentation, or improving the UI. Look for issues labeled good first issue.

---

## Ethical Disclaimer

This application contains intentional vulnerabilities and is designed strictly for educational use in controlled environments. Do not use anything demonstrated here against systems you do not own or have explicit permission to test. The developer is not responsible for any misuse.