import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { faker } from "@faker-js/faker";
import { Response } from "supertest";
import httpStatus from "http-status";

// Mock Cognito client
export const mockCognitoClient = new CognitoIdentityProviderClient({});

// Test data generators
export const testUserData = {
  name: "John Doe",
  email: "test@example.com",
  preferred_username: "testuser123",
  password: "TestPass123!",
};

// Helper to create a test user with Cognito mock
export async function createTestUser(customData: Partial<typeof testUserData> = {}) {
  const userData = { ...testUserData, ...customData };
  
  // Mock Cognito response
  const mockUserId = faker.string.uuid();
  const mockAccessToken = `mock_access_token_${mockUserId}`;
  const mockIdToken = `mock_id_token_${mockUserId}`;
  const mockRefreshToken = `mock_refresh_token_${mockUserId}`;

  return {
    user: {
      user_id: mockUserId,
      ...userData,
    },
    tokens: {
      accessToken: mockAccessToken,
      idToken: mockIdToken,
      refreshToken: mockRefreshToken,
    },
  };
}

// Response expectation helpers
export function expectSuccess(response: Response, expectedStatus: number = httpStatus.OK) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(true);
}

export function expectError(response: Response, expectedStatus: number = httpStatus.BAD_REQUEST) {
  expect(response.status).toBe(expectedStatus);
  if (response.body.success !== undefined) {
    expect(response.body.success).toBe(false);
  }
  expect(response.body.message || response.body.error).toBeDefined();
}

// Mock data for leaderboard
export const mockLeaderboardData = {
  score: faker.number.int({ min: 0, max: 2000 }),
  highScore: faker.number.int({ min: 1001, max: 5000 }),
  lowScore: faker.number.int({ min: 0, max: 999 }),
};

// Faker utilities export
export const fakerUtils = {
  email: faker.internet.email().toLowerCase(),
  fullName: faker.person.fullName(),
  username: faker.internet.username().toLowerCase(),
  uuid: faker.string.uuid(),
};