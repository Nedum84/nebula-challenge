import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import config from "../config/config";
import { CognitoUser, RegisterData, LoginData } from "./auth.service";

// Mock user store for local development
const mockUsers = new Map<string, {
  userId: string;
  email: string;
  preferred_username: string;
  name: string;
  password: string;
  confirmed: boolean;
  confirmationCode?: string;
}>();

export class CognitoMockService {
  // Generate a valid JWT token for local development
  static generateJWT(user: CognitoUser): string {
    const payload = {
      sub: user.user_id,
      email: user.email,
      preferred_username: user.preferred_username,
      name: user.name,
      email_verified: true,
      iss: `https://cognito-idp.${config.AWS_REGION}.amazonaws.com/${config.COGNITO_USER_POOL_ID}`,
      client_id: config.COGNITO_CLIENT_ID,
      token_use: "access",
      scope: "aws.cognito.signin.user.admin",
      auth_time: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (config.jwt.accessExpires * 60),
    };

    return jwt.sign(payload, config.JWT_SECRET);
  }

  static async register(data: RegisterData): Promise<{ message: string; user_id: string }> {
    const { email, preferred_username, name, password } = data;

    // Check if user already exists
    for (const [, user] of mockUsers) {
      if (user.email === email) {
        const error = new Error("User with this email already exists");
        (error as any).name = "UsernameExistsException";
        throw error;
      }
    }

    // Validate password (basic validation)
    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters long");
      (error as any).name = "InvalidPasswordException";
      throw error;
    }

    const userId = randomUUID();
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    mockUsers.set(email, {
      userId,
      email,
      preferred_username,
      name,
      password,
      confirmed: false,
      confirmationCode,
    });

    console.log(`🧪 [MOCK COGNITO] User registered: ${email}`);
    console.log(`🔑 [MOCK COGNITO] Confirmation code: ${confirmationCode}`);

    return {
      message: "Registration successful. Please check your email for verification code.",
      user_id: userId,
    };
  }

  static async confirmSignUp(email: string, confirmationCode: string): Promise<{ message: string }> {
    const user = mockUsers.get(email);
    
    if (!user) {
      const error = new Error("User not found");
      (error as any).name = "UserNotFoundException";
      throw error;
    }

    if (user.confirmationCode !== confirmationCode) {
      const error = new Error("Invalid confirmation code");
      (error as any).name = "CodeMismatchException";
      throw error;
    }

    // Confirm the user
    user.confirmed = true;
    delete user.confirmationCode;
    mockUsers.set(email, user);

    console.log(`✅ [MOCK COGNITO] User confirmed: ${email}`);

    return { message: "Email confirmation successful" };
  }

  static async login(data: LoginData): Promise<{
    user: CognitoUser;
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const user = mockUsers.get(email);

    if (!user) {
      const error = new Error("User not found");
      (error as any).name = "UserNotFoundException";
      throw error;
    }

    if (user.password !== password) {
      const error = new Error("Invalid credentials");
      (error as any).name = "NotAuthorizedException";
      throw error;
    }

    if (!user.confirmed) {
      const error = new Error("User account is not confirmed");
      (error as any).name = "UserNotConfirmedException";
      throw error;
    }

    const cognitoUser: CognitoUser = {
      user_id: user.userId,
      email: user.email,
      preferred_username: user.preferred_username,
      name: user.name,
      email_verified: true,
    };

    const accessToken = this.generateJWT(cognitoUser);
    const idToken = this.generateJWT(cognitoUser); // In real Cognito, this would be different
    const refreshToken = `mock_refresh_${randomUUID()}`;

    console.log(`🔐 [MOCK COGNITO] User logged in: ${email}`);

    return {
      user: cognitoUser,
      accessToken,
      idToken,
      refreshToken,
    };
  }

  static async verifyAccessToken(accessToken: string): Promise<CognitoUser> {
    try {
      const decoded = jwt.verify(accessToken, config.JWT_SECRET) as any;
      
      const cognitoUser: CognitoUser = {
        user_id: decoded.sub,
        email: decoded.email,
        preferred_username: decoded.preferred_username,
        name: decoded.name,
        email_verified: decoded.email_verified || true,
      };

      return cognitoUser;
    } catch (error) {
      const authError = new Error("Invalid or expired access token");
      (authError as any).name = "NotAuthorizedException";
      throw authError;
    }
  }

  // Utility methods for testing
  static createTestUser(email = "test@example.com", password = "TestPass123!"): void {
    const userId = randomUUID();
    mockUsers.set(email, {
      userId,
      email,
      preferred_username: "testuser",
      name: "Test User",
      password,
      confirmed: true,
    });
    console.log(`🧪 [MOCK COGNITO] Test user created: ${email} / ${password}`);
  }

  static clearAllUsers(): void {
    mockUsers.clear();
    console.log("🧹 [MOCK COGNITO] All mock users cleared");
  }

  static getAllUsers(): Array<{ email: string; confirmed: boolean; name: string }> {
    return Array.from(mockUsers.values()).map(user => ({
      email: user.email,
      confirmed: user.confirmed,
      name: user.name,
    }));
  }
}

// Initialize with a test user for convenience
CognitoMockService.createTestUser();
CognitoMockService.createTestUser("admin@nebula.com", "AdminPass123!");

export default CognitoMockService;