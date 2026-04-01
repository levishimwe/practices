const { Worker } = require('bullmq');
const { createRedisConnection } = require('./config/redis');
const { Event, Category, User } = require('./models');

const connection = createRedisConnection();

const worker = new Worker(
  'eventNotifications',
  async (job) => {
    if (!job?.data?.eventId) {
      return;
    }

    const event = await Event.findByPk(job.data.eventId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name'] }
      ]
    });
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
