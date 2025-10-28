import request from 'supertest';
import app from '../../src/app';

const regularUser = {
  email: 'profile.user@example.com',
  password: 'Password123!',
  name: 'Profile User',
};

const adminCredentials = {
  email: process.env.ADMIN_EMAIL!,
  password: process.env.ADMIN_PASSWORD!,
};

describe('Профиль пользователя', () => {
  let accessToken: string;

  beforeEach(async () => {
    await request(app).post('/v1/users/register').send(regularUser);
    const loginResponse = await request(app).post('/v1/users/login').send({
      email: regularUser.email,
      password: regularUser.password,
    });
    accessToken = loginResponse.body.data.token;
  });

  it('возвращает 401 при отсутствии токена', async () => {
    const response = await request(app).get('/v1/users/me');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('возвращает профиль при валидном токене', async () => {
    const response = await request(app)
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(regularUser.email);
  });

  it('обновляет профиль пользователя', async () => {
    const response = await request(app)
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Name');
  });

  it('позволяет админу получить список пользователей', async () => {
    const adminLogin = await request(app).post('/v1/users/login').send(adminCredentials);
    const adminToken = adminLogin.body.data.token;

    const response = await request(app)
      .get('/v1/users')
      .query({ limit: 10, offset: 0 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(typeof response.body.data.total).toBe('number');
  });
});

