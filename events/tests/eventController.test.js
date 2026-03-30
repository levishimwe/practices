jest.mock('../src/repositories/eventRepository', () => ({
  searchByRadius: jest.fn()
}));

const eventRepo = require('../src/repositories/eventRepository');
const eventController = require('../src/controllers/eventController');

describe('eventController.search', () => {
  test('returns searched events with parsed params', async () => {
    const req = {
      query: {
        latitude: '40.12',
        longitude: '-74.11',
        radiusKm: '15',
        categoryIds: '1,2,3'
      }
    };

    const res = {
      json: jest.fn()
    };

    const next = jest.fn();

    eventRepo.searchByRadius.mockResolvedValue([{ id: 1, title: 'Music Fest' }]);

    await eventController.search(req, res, next);

    expect(eventRepo.searchByRadius).toHaveBeenCalledWith({
      latitude: 40.12,
      longitude: -74.11,
      radiusKm: 15,
      categoryIds: [1, 2, 3]
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1, title: 'Music Fest' }] });
    expect(next).not.toHaveBeenCalled();
  });
});
