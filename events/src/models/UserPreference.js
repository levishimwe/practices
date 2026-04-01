const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPreference = sequelize.define('UserPreference', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'user_preferences',
  timestamps: false,
});

module.exports = UserPreference;
