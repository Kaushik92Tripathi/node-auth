// models/user.js
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true // Null if using social login
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 13 // Minimum age requirement
    }
  },
  facebookId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  googleId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  twitterId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  linkedinId: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      // Only hash the password if it exists (not null for social login)
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to compare passwords
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Sync the model with the database
sequelize.sync()
  .then(() => console.log('User model synced with database'))
  .catch(err => console.error('Error syncing user model:', err));

module.exports = User;