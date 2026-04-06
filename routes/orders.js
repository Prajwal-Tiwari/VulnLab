const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─── Middleware: Check if user is logged in ───────────────
function isLoggedIn(req, res, next) {
  if (!req.session.user_id) {
    return res.redirect('/auth/login');
  }
  next();
}

// ─── Helper: Get current difficulty ──────────────────────
function getDifficulty(req) {
  return req.session.difficulty || 'low';
}

// ─── GET /dashboard ───────────────────────────────────────
router.get('/dashboard', isLoggedIn, (req, res) => {
  const difficulty = getDifficulty(req);
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.session.user_id);

  res.render('dashboard', {
    username: req.session.username,
    orders: orders,
    difficulty: difficulty
  });
});

// ─── GET /orders/:id ──────────────────────────────────────
// Behavior changes based on difficulty
router.get('/orders/:id', isLoggedIn, (req, res) => {
  const difficulty = getDifficulty(req);

  // ── LOW ─────────────────────────────────────────────────
  // No protection — fetch by plain integer ID, no ownership check
  if (difficulty === 'low') {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) return res.status(404).send('Order not found!');

    return res.render('order', {
      order: order,
      session_user_id: req.session.user_id,
      difficulty: 'low',
      vulnerable: true,
      explanation: {
        title: '🔴 Low — No Protection',
        what: 'The server fetches orders using a plain sequential integer ID with no ownership check.',
        why: 'An attacker can simply increment the ID in the URL to access any order in the database.',
        code: "const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);\n// No ownership check — IDOR vulnerability!"
      }
    });
  }

  // ── MEDIUM ───────────────────────────────────────────────
  // Partial protection — ID is base64 encoded but still decodable
  if (difficulty === 'medium') {
    let realId;

    try {
      // Decode base64 to get real ID
      realId = Buffer.from(req.params.id, 'base64').toString('utf8');
    } catch (e) {
      return res.status(400).send('Invalid order ID format.');
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(realId);

    if (!order) return res.status(404).send('Order not found!');

    // Still no ownership check — still vulnerable!
    return res.render('order', {
      order: order,
      session_user_id: req.session.user_id,
      difficulty: 'medium',
      vulnerable: true,
      explanation: {
        title: '🟡 Medium — Security Through Obscurity',
        what: 'The server uses Base64 encoded IDs instead of plain integers. The ID looks random but is just encoded.',
        why: 'Base64 is not encryption — anyone can decode it. Run btoa("4") in browser console to get the encoded ID.',
        code: "// Encoded ID: btoa('4') = 'NA=='\n// Decoded: atob('NA==') = '4'\n// Still no ownership check — still vulnerable!"
      }
    });
  }

  // ── HIGH ─────────────────────────────────────────────────
  // Strong protection — UUID + ownership check
  if (difficulty === 'high') {
    const order = db.prepare('SELECT * FROM orders WHERE uuid = ?').get(req.params.id);

    if (!order) return res.status(404).send('Order not found!');

    // Ownership check — this is the fix!
    if (order.user_id !== req.session.user_id) {
      return res.status(403).render('forbidden', {
        order_id: req.params.id,
        order_owner: order.user_id,
        session_user: req.session.user_id,
        difficulty: 'high'
      });
    }

    return res.render('order', {
      order: order,
      session_user_id: req.session.user_id,
      difficulty: 'high',
      vulnerable: false,
      explanation: {
        title: '🟢 High — Proper Protection',
        what: 'Orders use unpredictable UUIDs AND the server verifies ownership before returning data.',
        why: 'Even if an attacker somehow gets a UUID, the ownership check blocks unauthorized access.',
        code: "// UUID: f47ac10b-58cc-4372-a567-0e02b2c3d479\nif (order.user_id !== req.session.user_id) {\n  return res.status(403).render('forbidden');\n}"
      }
    });
  }
});

// ─── GET /settings ────────────────────────────────────────
router.get('/settings', isLoggedIn, (req, res) => {
  res.render('settings', {
    difficulty: getDifficulty(req)
  });
});

// ─── POST /settings ───────────────────────────────────────
router.post('/settings', isLoggedIn, (req, res) => {
  const { difficulty } = req.body;
  if (['low', 'medium', 'high'].includes(difficulty)) {
    req.session.difficulty = difficulty;
  }
  res.redirect('/settings');
});

//GET /learn
router.get('/learn', isLoggedIn, (req, res) => {
  res.render('learn');
});


//GET /secure/orders/:id (fixed)
router.get('/secure/orders/:id', isLoggedIn, (req, res)=> {
  const orderId = req.params.id;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  //if order doesn't exist:
  if(!order){
    return res.status(404).send('Order not found!');
  }

  //fix: verify ownership before returning data
  if(order.user_id !== req.session.user_id) {
  return res.status(403).render('forbidden',{
    order_id: orderId,
    order_owner: order.user_id,
    session_user: req.session.user_id
  });
  }

  res.render('order', {
    order: order,
    session_user_id: req.session.user_id,
    vulnerable: false
  });
});

module.exports = router;    