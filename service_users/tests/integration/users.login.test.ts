import request from 'supertest';
import app from '../../src/app';

const userCredentials = {
  email: 'login.user@example.com',
  password: 'Password123!',
  name: 'Login User',
};

describe('POST /v1/users/login', () => {
  beforeEach(async () => {
    await request(app).post('/v1/users/register').send(userCredentials);
  });

  it('возвращает JWT при корректных данных', async () => {
    const response = await request(app).post('/v1/users/login').send({
      email: userCredentials.email,
      password: userCredentials.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(userCredentials.email);
  });

  it('возвращает 401 при неверном пароле', async () => {
    const response = await request(app).post('/v1/users/login').send({
      email: userCredentials.email,
      password: 'WrongPassword!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('возвращает 400 при невалидном теле запроса', async () => {
    const response = await request(app).post('/v1/users/login').send({ email: userCredentials.email });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });
});

