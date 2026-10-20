const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');

let studentToken = '';
let recruiterToken = '';
let adminToken = '';
let sampleJobId = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('PlacementOS Core API Test Suite', () => {
  test('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  test('POST /api/auth/login with valid student credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student.alex@college.edu',
        password: 'Student@1234Password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toEqual('student');
    studentToken = res.body.token;
  });

  test('POST /api/auth/login with valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@college.edu',
        password: 'Admin@1234Password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toEqual('admin');
    adminToken = res.body.token;
  });

  test('POST /api/auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@college.edu',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/students/profile should retrieve student profile with completeness', async () => {
    const res = await request(app)
      .get('/api/students/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.fullName).toEqual('Alex Chen');
    expect(res.body.completeness).toBeGreaterThan(50);
  });

  test('GET /api/jobs should return paginated job listings', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
    sampleJobId = res.body.jobs[0]._id;
  });

  test('GET /api/jobs/:id should return job details with eligibility evaluation for student', async () => {
    const res = await request(app)
      .get(`/api/jobs/${sampleJobId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.job._id).toEqual(sampleJobId);
    expect(res.body.eligibility).toBeDefined();
  });

  test('RBAC: Student should be forbidden from accessing admin analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  test('RBAC: Admin should successfully access administrative analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analytics.students.total).toBeGreaterThanOrEqual(1);
    expect(res.body.analytics.applications).toBeDefined();
  });

  test('Duplicate application prevention: applying again to same job returns 409', async () => {
    // First application to sampleJobId
    const firstRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: sampleJobId
      });

    // Second application to the exact same job must return 409 Conflict
    const secondRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: sampleJobId
      });

    expect(secondRes.statusCode).toEqual(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toContain('already submitted an application');
  });

  test('Data Sources health status reports accurately', async () => {
    const res = await request(app)
      .get('/api/sync/sources')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.sources)).toBe(true);
    // Providers without API keys in .env should be marked isConfigured: false
    const adzuna = res.body.sources.find(s => s.providerKey === 'adzuna');
    expect(adzuna).toBeDefined();
  });
});
