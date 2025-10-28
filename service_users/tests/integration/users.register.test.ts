import request from 'supertest';
import app from '../../src/app';

const buildUserPayload = () => ({
  email: `user_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`,
  password: 'Password123!',
  name: 'Test User',
});

describe('POST /v1/users/register', () => {
  it('успешно регистрирует пользователя с валидными данными', async () => {
    const payload = buildUserPayload();

    const response = await request(app).post('/v1/users/register').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        email: payload.email,
        name: payload.name,
        role: 'user',
      })
    );
  });

  it('возвращает ошибку при повторной регистрации с тем же email', async () => {
    const payload = buildUserPayload();

    const first = await request(app).post('/v1/users/register').send(payload);
    expect(first.status).toBe(201);

    const duplicate = await request(app).post('/v1/users/register').send(payload);

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.success).toBe(false);
    expect(duplicate.body.error).toEqual(
      expect.objectContaining({
        code: 'USER_EXISTS',
        message: 'User already exists',
      })
    );
  });

  it('валидирует входные данные и возвращает 400 при пустом запросе', async () => {
    const response = await request(app).post('/v1/users/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });
});

