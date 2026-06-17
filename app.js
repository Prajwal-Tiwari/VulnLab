const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db/database');


const app = express();
const PORT = 3000;

//serves static files from the /public
app.use(express.static(path.join(__dirname, 'public')));

//allows express to read from data and json
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Session setup
app.use(session({
  secret: 'vulnlab-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } //session lasts 1 hr
}));

//Routes
const authRoute = require('./routes/auth');
app.use('/auth', authRoute);

const orderRoute = require('./routes/orders');
app.use('/', orderRoute);

//Route Redirect
app.get('/', (req,res) => {
  res.redirect('/login.html');
})

//Start server
app.listen(PORT, () => {
  console.log(`Vulnlab running at http://localhost:${PORT}`);
})