const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventCategory = sequelize.define('EventCategory', {
  event_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'event_categories',
  timestamps: false,
});

module.exports = EventCategory;
