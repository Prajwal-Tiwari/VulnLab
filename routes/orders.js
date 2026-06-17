const express = require('express');
const router = express.Router();
const db = require('../db/database');

//Middleware: check if user is logged in 
function isLoggedin(req, res, next) {
  if (!req.session.user_id) {
    return res.status(401).json({error: 'Not logged in'});
  }
  next();
}

//Helper
function getDifficulty(req) {
  return req.session.difficulty || 'low';//the low difficulty is default
}

//GET /api/dashboard
router.get('/api/dashboard', isLoggedin, (req, res) => {
  const diff = getDifficulty(req);
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.session.user_id);

  res.json ({
    username: req.session.username,
    difficulty: diff,
    orders: orders
  });
});

//GET /api/orders/:id
router.get('/api/orders/:id', isLoggedin, (req, res) => {
  const diff = getDifficulty(req);

  //Low
  if(diff === 'low'){
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({error: 'Order not found'});

    return res.json({
      order,
      difficulty: 'low',
      vulnerable: true,
      explanation: {
        title: 'Low — No Protection',
        what: 'The server fetches orders using a plain sequential integer ID with no ownership check.',
        why: 'An attacker can simply increment the ID in the URL to access any order in the database.',
        code: "const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);\n// No ownership check — IDOR vulnerability!"
      }
    });
  }

  //Medium
  if(diff === 'medium') {
    let realId;
    try {
      realId = Buffer.from(req.params.id, 'base64').toString('utf8');
    } catch(e) {
      return res.status(401).json({error: 'Invalid order ID format'});
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(realId);
    if(!order) {
      return res.status(404).json({error: 'No order found'});
    }
    return res.json({
      order,
      difficulty: 'medium',
      vulnerable: true,
      explanation: {
        title: 'Medium — Security Through Obscurity',
        what: 'The server uses Base64 encoded IDs instead of plain integers. The ID looks random but is just encoded.',
        why: "Base64 is not encryption — anyone can decode it. Run atob('NA==') in browser console to get the real ID.",
        code: "// Encoded ID: btoa('4') = 'NA=='\n// Decoded: atob('NA==') = '4'\n// Still no ownership check — still vulnerable!"
      }
    });
  }

  //High
  if(diff === 'high') {
    const order = db.prepare('SELECT * FROM orders WHERE uuid = ?').get(req.params.id);
    if(!order){
      return res.status(404).json({error: 'Order not found'});
    }
    if (order.user_id != req.session.user_id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        difficulty: 'high',
        order_id: req.params.id,
        order_owner: order.user_id,
        session_user: req.session.user_id
      });
    }
    return res.json({
      order,
      difficulty: 'high',
      vulnerable: false,
      explanation: {
        title: 'High — Proper Protection',
        what: 'Orders use unpredictable UUIDs AND the server verifies ownership before returning data.',
        why: 'Even if an attacker somehow gets a UUID, the ownership check blocks unauthorized access.',
        code: "if (order.user_id !== req.session.user_id) {\n  return res.status(403).json({ error: 'Forbidden' });\n}"
      }
    });
  }
})

//GET /api/settings
router.get('/api/settings', isLoggedin, (req, res) => {
  res.json({difficulty: getDifficulty(req)});
})

// POST /api/settings
router.post('/api/settings', isLoggedin, (req, res) => {
  const {difficulty} = req.body;
  if (['low', 'medium', 'high'].includes(difficulty)) {
    req.session.difficulty = difficulty;
  }
  res.json({success: true, difficulty: req.session.difficulty});
});

module.exports = router;