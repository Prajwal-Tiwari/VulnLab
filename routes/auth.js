const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─── GET /auth/register ───────────────────────────────────
// Shows the register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// ─── POST /auth/register ──────────────────────────────────
// Handles registration form submission
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.render('register', { error: 'Username already taken!' });
  }

  // Insert new user
  const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  insertUser.run(username, password);

  // Redirect to login after successful registration
  res.redirect('/auth/login');
});

// ─── GET /auth/login ──────────────────────────────────────
// Shows the login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// ─── POST /auth/login ─────────────────────────────────────
// Handles login form submission
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in database
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

  if (!user) {
    return res.render('login', { error: 'Invalid username or password!' });
  }

  // Save user info in session
  req.session.user_id = user.id;
  req.session.username = user.username;

  // Redirect to dashboard
  res.redirect('/dashboard');
});

// ─── GET /auth/logout ─────────────────────────────────────
// Logs the user out by destroying session
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;