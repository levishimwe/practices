const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const { redis } = require('../config/env');
const eventRepo = require('../repositories/eventRepository');
const userRepo = require('../repositories/userRepository');
const notificationRepo = require('../repositories/notificationRepository');

let queue = null;

function getQueue() {
  if (!queue) {
    const connection = new IORedis({
      host: redis.host,
      port: redis.port,
      maxRetriesPerRequest: null
    });

    queue = new Queue('eventNotifications', { connection });
  }
  return queue;
}

async function enqueueEventNotification(event) {
  const q = getQueue();
  await q.add(
    'notifyEventCreated',
    { eventId: event.id },
    { removeOnComplete: true, removeOnFail: true }
  );

  const users = await findMatchingUsersForEvent(event);
  for (const user of users) {
    await notificationRepo.createLog({
      eventId: event.id,
      userId: user.id,
      notificationType: 'event_created',
      status: 'queued'
    });
  }
}

async function enqueueUpcomingNotifications(hours = 24) {
  const q = getQueue();
  const events = await eventRepo.listUpcomingWithinHours(hours);

  for (const event of events) {
    await q.add(
      'notifyUpcomingEvent',
      { eventId: event.id },
      { delay: 5000, removeOnComplete: true, removeOnFail: true }
    );
  }

  return events.length;
}

async function findMatchingUsersForEvent(event) {
  const allCategoryIds = event.categories?.map((c) => c.id) || [];
  return userRepo.listUsersByPreferredCategories(allCategoryIds);
}

module.exports = {
  enqueueEventNotification,
  enqueueUpcomingNotifications,
  findMatchingUsersForEvent
};
