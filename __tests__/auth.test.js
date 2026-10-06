import { authenticateLocalUser, createLocalAccount } from '../src/lib/auth';

describe('local account rules', () => {
  test('rejects a registration when the passwords do not match', () => {
    const result = createLocalAccount([], 'kalil', 'aroma123', 'aroma321');
    expect(result.error).toMatch(/no coinciden/i);
  });

  test('accepts a matching account and validates login case-insensitively', () => {
    const result = createLocalAccount([], 'Kalil', 'aroma123', 'aroma123');
    expect(result.user.username).toBe('Kalil');
    expect(authenticateLocalUser(result.users, 'kalil', 'aroma123')).toEqual(result.user);
  });
});
