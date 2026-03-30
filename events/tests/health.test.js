const request = require('supertest');
const app = require('../src/app');

describe('health endpoint', () => {
  test('GET /api/health should return ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
