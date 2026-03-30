jest.mock('../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  replacePreferences: jest.fn(),
  findById: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../src/repositories/userRepository');
const authService = require('../src/services/authService');

describe('authService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('register hashes password and returns token', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.createUser.mockResolvedValue(10);
    userRepo.replacePreferences.mockResolvedValue(undefined);
    userRepo.findById.mockResolvedValue({ id: 10, email: 'a@b.com' });

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw');
    jest.spyOn(jwt, 'sign').mockReturnValue('token123');

    const result = await authService.register({
      name: 'Levi',
      email: 'a@b.com',
      password: 'secret123',
      preferredCategoryIds: [1, 2]
    });

    expect(userRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: 'hashed_pw' }));
    expect(result.token).toBe('token123');
    expect(result.user.id).toBe(10);
  });

  test('login rejects invalid user', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(authService.login({ email: 'none@x.com', password: '123456' })).rejects.toThrow(
      'Invalid email or password'
    );
  });
});
