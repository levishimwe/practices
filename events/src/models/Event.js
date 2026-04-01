const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
      len: { args: [3, 200], msg: 'Title must be between 3 and 200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      notNull: { msg: 'Latitude is required' },
      min: { args: [-90], msg: 'Latitude must be >= -90' },
      max: { args: [90], msg: 'Latitude must be <= 90' },
    },
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      notNull: { msg: 'Longitude is required' },
      min: { args: [-180], msg: 'Longitude must be >= -180' },
      max: { args: [180], msg: 'Longitude must be <= 180' },
    },
  },
  location_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'Start time is required' },
      isDate: { msg: 'Start time must be a valid date' },
    },
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: { msg: 'End time must be a valid date' },
      isAfterStart(value) {
        if (value && this.start_time && value <= this.start_time) {
          throw new Error('End time must be after start time');
        }
      },
    },
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Event.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
User.hasMany(Event, { foreignKey: 'creator_id', as: 'events' });

module.exports = Event;
