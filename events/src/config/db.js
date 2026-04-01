const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const { db } = require('./env');

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const sequelize = new Sequelize(db.database, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'mysql',
  logging: false
});

module.exports = pool;
module.exports.pool = pool;
module.exports.sequelize = sequelize;
