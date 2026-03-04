# 🧪 VulnLab — IDOR Vulnerability Lab

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Web_Framework-lightgrey)
![Security Lab](https://img.shields.io/badge/Web_Security-IDOR_Lab-red)
![License](https://img.shields.io/badge/License-MIT-blue)

A deliberately vulnerable web application built to demonstrate and study **Insecure Direct Object Reference (IDOR)** — one of the most common and impactful web security vulnerabilities.

> ⚠️ This application is intentionally insecure. Run it only in a **local or controlled environment**. Never deploy it publicly.

Current Version: **v1.0**

---

## What is VulnLab?

VulnLab is a **hands-on web security learning lab** designed to demonstrate how vulnerabilities appear in backend systems.

It simulates a simple e-commerce order system with an **IDOR vulnerability** so learners can:

- observe the vulnerability
- exploit it
- understand the impact
- see the correct fix

This project is **not a CTF challenge**.  
It is designed as a **controlled learning environment** that demonstrates the full lifecycle:

**exploit → impact → fix**

---

## The Vulnerability

IDOR (Insecure Direct Object Reference) occurs when an application exposes internal object identifiers (like database IDs) without verifying that the requesting user actually owns the resource.

Example vulnerable route:

```javascript
// ❌ Vulnerable — no ownership check
app.get('/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.render('order', { order });
});
```

Secure version:

```javascript
// ✅ Secure — ownership verified
if (order.user_id !== req.session.user_id) {
  return res.status(403).send('Forbidden');
}
```

One missing authorization check can lead to **complete data exposure**.

---

## Setup & Installation

### Option 1 — Run with Node.js

Make sure Node.js is installed.

```bash
git clone https://github.com/YOUR_USERNAME/VulnLab.git
cd VulnLab
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

### Option 2 — Run with Docker

Ensure Docker Desktop is running.

```bash
git clone https://github.com/YOUR_USERNAME/VulnLab.git
cd VulnLab
docker build -t vulnlab .
docker run -p 3000:3000 vulnlab
```

Open:

```
http://localhost:3000
```

---

## Test Accounts

The database comes pre-seeded with two users.

| Username | Password |
|----------|----------|
| alice    | alice123 |
| bob      | bob123   |

---

## How to Exploit IDOR in this Lab

1. Login as `alice / alice123`
2. View Alice's orders on the dashboard
3. Click any order — it opens at `/orders/1`
4. Change the URL manually to `/orders/4`
5. You will now see **Bob's order**

The application will display a 🚨 banner explaining the data breach.

---

## How to See the Secure Fix

1. Return to the dashboard
2. Click **🟢 Secure** on any order
3. Change the order ID again
4. The server will return **403 Forbidden**

Attack blocked.

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
│   └── learn.ejs
├── public/
│   └── style.css
├── app.js
├── Dockerfile
└── README.md
```

---

## Tech Stack

Backend
- Node.js
- Express.js

Database
- SQLite (better-sqlite3)

Authentication
- express-session (session-based authentication)

Frontend
- EJS templates
- Vanilla CSS

Containerization
- Docker

---

## Learning Outcomes

After completing this lab you should understand:

- What **IDOR vulnerabilities** are
- Why **authentication ≠ authorization**
- How predictable IDs enable attacks
- How missing authorization checks cause data breaches
- How to implement **object-level authorization**

---

## Roadmap

VulnLab will evolve into a broader web security learning platform.

Future plans include:

- Difficulty modes
- XSS vulnerability labs
- CSRF vulnerability labs
- API authorization flaws
- Security misconfiguration scenarios
- Advanced backend attack chains

---

## Changelog

See version history in:

```
CHANGELOG.md
```

---

## Want to Contribute?

Contributions are welcome.

If you're interested in **web security education or backend development**, you can help by:

- Adding new vulnerability labs
- Improving vulnerability explanations
- Writing documentation
- Enhancing UI
- Adding logging or tests

Look for issues labeled **good first issue**.

---

## Ethical Disclaimer

This application contains **intentional vulnerabilities** and is designed strictly for educational purposes in controlled environments.

Do **not** use the techniques demonstrated here against systems you do not own or have explicit permission to test.

The developer is not responsible for any misuse of this project.
