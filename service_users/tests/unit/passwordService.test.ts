import { passwordService } from '../../src/services/passwordService';

describe('passwordService', () => {
  it('корректно хэширует и сравнивает пароль', async () => {
    const password = 'StrongPassword123!';
    const hash = await passwordService.hash(password);

    expect(hash).not.toBe(password);
    await expect(passwordService.compare(password, hash)).resolves.toBe(true);
    await expect(passwordService.compare('other', hash)).resolves.toBe(false);
  });
});

