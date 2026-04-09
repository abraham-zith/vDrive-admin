/**
 * Mock data for testing authentication endpoints
 */

// Mock hashed password for test users (same for all)
const TEST_HASHED_PASSWORD = '$2b$10$encryptedPasswordForTesting123';

export const mockUsers = [
  {
    id: 'auth-user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: TEST_HASHED_PASSWORD,
    role: 'user',
  },
  {
    id: 'auth-admin-456',
    name: 'Test Admin',
    email: 'admin@example.com',
    password: TEST_HASHED_PASSWORD,
    role: 'admin',
  },
];

export const mockHotspots = [
  {
    id: 'HOT123',
    hotspot_name: 'Test Hotspot',
    fare: 45.0,
    multiplier: 1.3,
  },
];

// Mock JWT tokens for testing
export const mockTokens = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-access-token',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-refresh-token',
};

// Expected test responses
export const expectedResponses = {
  auth: {
    signin: {
      success: true,
      message: 'User signed in successfully',
    },
    refreshToken: {
      success: true,
      message: 'Access token refreshed successfully',
    },
    signout: {
      success: true,
      message: 'User signed out successfully',
    },
    admin: {
      success: true,
      message: 'Admin user created successfully',
    },
    forgotPassword: {
      success: true,
      message: 'Forgot password link sent successfully',
    },
  },
};

export const testConfig = {
  jwt: {
    secret: 'test-jwt-secret-key',
    refreshSecret: 'test-refresh-secret-key',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
};
