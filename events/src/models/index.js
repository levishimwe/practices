const { Sequelize, Op } = require('sequelize');
const User = require('./User');
const Event = require('./Event');
const Category = require('./Category');
const EventCategory = require('./EventCategory');
const UserPreference = require('./UserPreference');
const Favorite = require('./Favorite');
const Review = require('./Review');
const NotificationLog = require('./NotificationLog');

Event.belongsToMany(Category, {
  through: EventCategory,
  foreignKey: 'event_id',
  otherKey: 'category_id',
  as: 'categories',
});

Category.belongsToMany(Event, {
  through: EventCategory,
  foreignKey: 'category_id',
  otherKey: 'event_id',
  as: 'events',
});

User.belongsToMany(Category, {
  through: UserPreference,
  foreignKey: 'user_id',
  otherKey: 'category_id',
  as: 'preferredCategories',
});

Category.belongsToMany(User, {
  through: UserPreference,
  foreignKey: 'category_id',
  otherKey: 'user_id',
  as: 'preferredByUsers',
});

User.belongsToMany(Event, {
  through: Favorite,
  foreignKey: 'user_id',
  otherKey: 'event_id',
  as: 'favoriteEvents',
});

Event.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'event_id',
  otherKey: 'user_id',
  as: 'favoritedByUsers',
});

Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Event.hasMany(Review, { foreignKey: 'event_id', as: 'reviews' });

module.exports = {
  Sequelize,
  Op,
  User,
  Event,
  Category,
  EventCategory,
  UserPreference,
  Favorite,
  Review,
  NotificationLog,
};
