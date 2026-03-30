const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_event'
  },
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379)
  }
};
