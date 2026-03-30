const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { redis } = require('./config/env');
const eventRepo = require('./repositories/eventRepository');

const connection = new IORedis({
  host: redis.host,
  port: redis.port,
  maxRetriesPerRequest: null
});

const worker = new Worker(
  'eventNotifications',
  async (job) => {
    if (!job?.data?.eventId) {
      return;
    }

    const event = await eventRepo.getEventById(job.data.eventId);
    if (!event) {
      return;
    }

    process.stdout.write(`Notification job ${job.name} for event ${event.title}\n`);
  },
  { connection }
);

worker.on('completed', (job) => {
  process.stdout.write(`Completed job ${job.id}\n`);
});

worker.on('failed', (job, err) => {
  process.stderr.write(`Failed job ${job?.id}: ${err.message}\n`);
});
