// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        
        // If user not found
        if (!user) {
          return done(null, false, { message: 'Email not registered' });
        }
        
        // If user found but no password (social login)
        if (!user.password) {
          return done(null, false, { message: 'Please log in with your social account' });
        }
        
        // Check password
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ where: { facebookId: profile.id } });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with the same email
      if (profile.emails && profile.emails[0].value) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          // Update user with Facebook ID
          user.facebookId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user if doesn't exist
      // NOTE: For Facebook login, we'd need to gather age separately since it's not provided
      // For this example, we'll set a default age of 18
      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
        facebookId: profile.id,
        age: 18 // Default age, may need to be collected separately
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));

  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Implementation similar to Facebook strategy
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (user) {
        return done(null, user);
      }
      
      if (profile.emails && profile.emails[0].value) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : `${profile.id}@google.com`,
        googleId: profile.id,
        age: 18 // Default age
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));

  // Twitter Strategy
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/callback',
    includeEmail: true
  }, async (token, tokenSecret, profile, done) => {
    try {
      // Implementation similar to Facebook strategy
      let user = await User.findOne({ where: { twitterId: profile.id } });
      
      if (user) {
        return done(null, user);
      }
      
      if (profile.emails && profile.emails[0].value) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          user.twitterId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : `${profile.id}@twitter.com`,
        twitterId: profile.id,
        age: 18 // Default age
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));

  // LinkedIn Strategy
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Implementation similar to Facebook strategy
      let user = await User.findOne({ where: { linkedinId: profile.id } });
      
      if (user) {
        return done(null, user);
      }
      
      if (profile.emails && profile.emails[0].value) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          user.linkedinId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : `${profile.id}@linkedin.com`,
        linkedinId: profile.id,
        age: 18 // Default age
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
};