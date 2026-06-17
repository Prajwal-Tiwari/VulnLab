const express = require('express');
const router = express.Router();
const db = require('../db/database');

//POST /auth/register
router.post('/register', (req, res) => {
  const {username, password} = req.body;
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(400).json({error: 'Username already taken! '});
  }
  const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?,?)');
  insertUser.run(username, password);
  res.json({success: true});
})

//POST /auth/login
router.post('/login', (req, res) => {
  const {username, password} = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

  if(!user) {
    return res.status(401).json({error: 'Invalid Username and password'});
  }
  req.session.user_id = user.id;
  req.session.username = user.username;

  res.json({success: true});
})

//GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
})

//GET /auth/me
router.get('/me', (req,res) => {
  if (!req.session.user_id) {
    return res.status(401).json({error: 'Not logged in'});
  }
  res.json({
    user_id: req.session.user_id,
    username: req.session.username
  });
});
module.exports = router;