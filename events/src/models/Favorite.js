const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Favorite;
