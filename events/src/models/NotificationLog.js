const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notification_type: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'queued',
  },
}, {
  tableName: 'notification_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = NotificationLog;
