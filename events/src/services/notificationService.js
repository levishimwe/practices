const { Queue } = require('bullmq');
const { createRedisConnection } = require('../config/redis');
const { Event, User, UserPreference, NotificationLog, Op } = require('../models');

let queue = null;

function getQueue() {
  if (!queue) {
    queue = new Queue('eventNotifications', { connection: createRedisConnection() });
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
    await NotificationLog.create({
      event_id: event.id,
      user_id: user.id,
      notification_type: 'event_created',
      status: 'queued'
    });
  }
}

async function enqueueUpcomingNotifications(hours = 24) {
  const q = getQueue();
  const now = new Date();
  const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const events = await Event.findAll({
    where: {
      start_time: {
        [Op.between]: [now, end]
      }
    },
    order: [['start_time', 'ASC']]
  });

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
  if (allCategoryIds.length === 0) {
    return [];
  }

  const preferences = await UserPreference.findAll({
    where: {
      category_id: {
        [Op.in]: allCategoryIds
      }
    },
    attributes: ['user_id'],
    group: ['user_id']
  });

  const userIds = preferences.map((preference) => preference.user_id);
  if (userIds.length === 0) {
    return [];
  }

  return User.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: ['id', 'name', 'email', 'language']
  });
}

module.exports = {
  enqueueEventNotification,
  enqueueUpcomingNotifications,
  findMatchingUsersForEvent
};
