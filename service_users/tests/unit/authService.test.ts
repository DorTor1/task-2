import { authService } from '../../src/services/authService';
import { userRepository } from '../../src/repositories/userRepository';
import { passwordService } from '../../src/services/passwordService';

jest.mock('../../src/repositories/userRepository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/services/passwordService', () => ({
  passwordService: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

describe('authService', () => {
  const mockedRepository = userRepository as jest.Mocked<typeof userRepository>;
  const mockedPasswordService = passwordService as jest.Mocked<typeof passwordService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('создает пользователя при отсутствии конфликта email', async () => {
      mockedRepository.findByEmail.mockReturnValueOnce(undefined as any);
      mockedPasswordService.hash.mockResolvedValueOnce('hashed-password');
      mockedRepository.create.mockImplementationOnce((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      const result = await authService.register({
        email: 'unit@example.com',
        password: 'Password123!',
        name: 'Unit User',
      });

      expect(mockedRepository.findByEmail).toHaveBeenCalledWith('unit@example.com');
      expect(mockedPasswordService.hash).toHaveBeenCalledWith('Password123!');
      expect(mockedRepository.create).toHaveBeenCalled();
      expect(result.email).toBe('unit@example.com');
    });

    it('выбрасывает USER_EXISTS при повторном email', async () => {
      mockedRepository.findByEmail.mockReturnValueOnce({
        id: 'existing',
        email: 'unit@example.com',
      } as any);

      await expect(
        authService.register({ email: 'unit@example.com', password: 'Password123!', name: 'Unit User' })
      ).rejects.toThrow('USER_EXISTS');
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('выбрасывает INVALID_CREDENTIALS при неверном пароле', async () => {
      mockedRepository.findByEmail.mockReturnValueOnce({
        id: 'user-id',
        email: 'unit@example.com',
        password_hash: 'stored',
        name: 'Unit User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);
      mockedPasswordService.compare.mockResolvedValueOnce(false);

      await expect(
        authService.login({ email: 'unit@example.com', password: 'WrongPassword!' })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });
});

