// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view this resource');
  res.redirect('/login');
}

// Home page
router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// Login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/profile');
  }
  res.render('login', { title: 'Login' });
});

// Signup page
router.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/profile');
  }
  res.render('signup', { title: 'Sign Up' });
});

// Profile page
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { title: 'Profile', user: req.user });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
});

// Process signup form
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, age } = req.body;
    const errors = [];

    // Validation
    if (!name || !email || !password || !confirmPassword || !age) {
      errors.push({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      errors.push({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      errors.push({ message: 'Password should be at least 6 characters' });
    }

    if (isNaN(age) || age < 13) {
      errors.push({ message: 'Age must be a number and at least 13' });
    }

    if (errors.length > 0) {
      return res.render('signup', { 
        title: 'Sign Up',
        errors,
        name,
        email,
        age
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      errors.push({ message: 'Email is already registered' });
      return res.render('signup', {
        title: 'Sign Up',
        errors,
        name,
        age
      });
    }

    // Create new user
    await User.create({
      name,
      email,
      password,
      age: parseInt(age)
    });

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (error) {
    console.error('Error in signup:', error);
    req.flash('error_msg', 'Server error. Please try again.');
    res.redirect('/signup');
  }
});

// Process login form
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Facebook Auth Routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// Google Auth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// Twitter Auth Routes
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// LinkedIn Auth Routes
router.get('/auth/linkedin', passport.authenticate('linkedin'));

router.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

module.exports = router;
