const IORedis = require('ioredis');
const { redis } = require('./env');

function createRedisConnection() {
  return new IORedis({
    host: redis.host,
    port: redis.port,
    maxRetriesPerRequest: null
  });
}

module.exports = {
  createRedisConnection
};
