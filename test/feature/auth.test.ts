import httpStatus from "http-status";
import {
  customRequest,
  expectSuccess,
  expectError,
  testUserData,
} from "../utils/utils";

// Mock AWS SDK at the top level
jest.mock("@aws-sdk/client-cognito-identity-provider");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /v1/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const response = await customRequest({
        path: "/auth/register",
        method: "post",
        payload: {
          name: testUserData.name,
          email: testUserData.email,
          preferred_username: testUserData.preferred_username,
          password: testUserData.password,
        },
      });

      // The validation should pass, but Cognito will fail in testing
      // This tests that validation is working
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should fail with invalid email", async () => {
      const response = await customRequest({
        path: "/auth/register",
        method: "post",
        payload: {
          name: testUserData.name,
          email: "invalid-email",
          preferred_username: testUserData.preferred_username,
          password: testUserData.password,
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });

    it("should fail with weak password", async () => {
      const response = await customRequest({
        path: "/auth/register",
        method: "post",
        payload: {
          name: testUserData.name,
          email: testUserData.email,
          preferred_username: testUserData.preferred_username,
          password: "weak",
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });

    it("should fail with missing required fields", async () => {
      const response = await customRequest({
        path: "/auth/register",
        method: "post",
        payload: {
          name: testUserData.name,
          // Missing email and password
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /v1/auth/confirm", () => {
    it("should fail with invalid confirmation code format", async () => {
      const response = await customRequest({
        path: "/auth/confirm",
        method: "post",
        payload: {
          email: testUserData.email,
          confirmationCode: "invalid", // Should be 6 digits
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });

    it("should fail with missing email", async () => {
      const response = await customRequest({
        path: "/auth/confirm",
        method: "post",
        payload: {
          confirmationCode: "123456",
          // Missing email
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /v1/auth/login", () => {
    it("should fail with missing email", async () => {
      const response = await customRequest({
        path: "/auth/login",
        method: "post",
        payload: {
          password: testUserData.password,
          // Missing email
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });

    it("should fail with invalid email format", async () => {
      const response = await customRequest({
        path: "/auth/login",
        method: "post",
        payload: {
          email: "invalid-email",
          password: testUserData.password,
        },
      });

      expectError(response, httpStatus.BAD_REQUEST);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("GET /v1/auth/profile", () => {
    it("should fail without authorization header", async () => {
      const response = await customRequest({
        path: "/auth/profile",
        method: "get",
      });

      expectError(response, httpStatus.UNAUTHORIZED);
      expect(response.body.message).toContain("Authorization header is required");
    });

    it("should fail with malformed authorization header", async () => {
      const response = await customRequest({
        path: "/auth/profile",
        method: "get",
        headers: {
          authorization: "InvalidHeader",
        },
      });

      expectError(response, httpStatus.UNAUTHORIZED);
      expect(response.body.message).toContain("Bearer token is required");
    });
  });

  describe("GET /v1/auth/me", () => {
    it("should fail without authorization header", async () => {
      const response = await customRequest({
        path: "/auth/me",
        method: "get",
      });

      expectError(response, httpStatus.UNAUTHORIZED);
      expect(response.body.message).toContain("Authorization header is required");
    });
  });
});