jest.mock('../src/repositories/eventRepository', () => ({
  listUpcomingWithinHours: jest.fn()
}));

jest.mock('bullmq', () => {
  const add = jest.fn();
  return {
    Queue: jest.fn().mockImplementation(() => ({ add })),
    __add: add
  };
});

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({}));
});

const eventRepo = require('../src/repositories/eventRepository');
const notificationService = require('../src/services/notificationService');
const { __add } = require('bullmq');

describe('notificationService', () => {
  test('enqueueUpcomingNotifications queues all upcoming events', async () => {
    eventRepo.listUpcomingWithinHours.mockResolvedValue([{ id: 11 }, { id: 12 }]);

    const count = await notificationService.enqueueUpcomingNotifications(24);

    expect(count).toBe(2);
    expect(__add).toHaveBeenCalledTimes(2);
  });
});
