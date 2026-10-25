const request = require('supertest');
const app = require('../src/app');

describe('Authentication API Endpoint Tests', () => {
  const testUser = {
    name: 'Jest Test Attendee',
    email: `jest_${Date.now()}@eventflow.com`,
    password: 'Password123!',
    role: 'ATTENDEE'
  };

  let accessToken = '';

  it('POST /api/v1/auth/register — Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
  });

  it('POST /api/v1/auth/login — Should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('GET /api/v1/auth/me — Should fetch authenticated profile using JWT Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
});
