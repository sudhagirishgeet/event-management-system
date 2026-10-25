const request = require('supertest');
const app = require('../src/app');

describe('Event Management API Endpoint Tests', () => {
  it('GET /api/v1/events — Should list published events', async () => {
    const res = await request(app).get('/api/v1/events');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.events)).toBe(true);
  });

  it('GET /api/v1/events/categories — Should fetch event categories', async () => {
    const res = await request(app).get('/api/v1/events/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});
