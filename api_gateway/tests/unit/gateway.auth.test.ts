jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { authMiddleware } from '../../src/middleware/auth';
import { signGatewayToken } from '../helpers/auth';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('API Gateway authMiddleware', () => {
  it('возвращает 401 при отсутствии заголовка Authorization', () => {
    const req: any = { header: () => undefined };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.objectContaining({ code: 'AUTH_REQUIRED' }) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('возвращает 401 при некорректном токене', () => {
    const req: any = { header: () => 'Bearer invalid.token.value' };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('передает управление при валидном токене и добавляет пользователя в req', () => {
    const token = signGatewayToken({ sub: 'user-123', email: 'user@example.com', role: 'admin' });
    const req: any = { header: () => `Bearer ${token}` };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ sub: 'user-123', email: 'user@example.com', role: 'admin' }));
  });
});

