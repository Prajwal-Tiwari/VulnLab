const express = require('express');
const router = express.Router();
const db = require('../db/database');

//middleware (Check if user is logged in or not)
function isLoggedIn(req, res, next){
    if (!req.session.user_id) {
        return res.redirect('/auth/login');
    }
    next();
}

//Get Dashboard
router.get('/dashboard', isLoggedIn, (req, res) => {
    //fetch only this user's orders
   const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.session.user_id); 

    res.render('dashboard', {
        username: req.session.username,
        orders: orders
    });
});

// ─── GET /learn ───────────────────────────────────────────
router.get('/learn', isLoggedIn, (req, res) => {
  res.render('learn');
});

// ─── GET /orders/:id (VULNERABLE) ────────────────────────
router.get('/orders/:id', isLoggedIn, (req, res) => {
  const orderId = req.params.id;

  // ⚠️ VULNERABLE CODE — fetches order by ID only
  // Does NOT check if this order belongs to the logged in user
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  // If order doesn't exist
  if (!order) {
    return res.status(404).send('Order not found!');
  }

  // Render order page — passing vulnerable: true to show warning banner
  res.render('order', {
    order: order,
    session_user_id: req.session.user_id,
    vulnerable: true
  });
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