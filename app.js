const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db/database');


const app = express();
const PORT = 3000;

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ───────────────────────────────────────────
// Allows Express to read form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serves static files like CSS from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session setup — this keeps users logged in
app.use(session({
  secret: 'vulnlab-secret-key',   // used to sign the session cookie
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // session lasts 1 hour
}));

// ─── Routes ──────────────────────────────────────────────
// We'll add these soon
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
const orderRoutes = require('./routes/orders');
app.use('/', orderRoutes);  

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VulnLab running at http://localhost:${PORT}`);
});