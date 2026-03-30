const request = require('supertest');
const app = require('../src/app');

describe('i18n messages', () => {
  test('returns spanish not found with x-language header', async () => {
    const response = await request(app).get('/api/unknown').set('x-language', 'es');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Ruta no encontrada');
  });
});
