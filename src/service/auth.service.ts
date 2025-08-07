import { cognitoService, CognitoUser, AuthResponse, RegisterData, LoginData } from "./cognito.service";
import { UnauthorizedError } from "../api-response";

// Re-export types for compatibility
export type { CognitoUser as PublicUser, AuthResponse, RegisterData, LoginData };

const register = async (data: RegisterData) => {
  return await cognitoService.register(data);
};

const confirmSignUp = async (email: string, confirmationCode: string) => {
  return await cognitoService.confirmSignUp(email, confirmationCode);
};

const login = async (data: LoginData): Promise<AuthResponse> => {
  return await cognitoService.login(data);
};

const getProfile = async (accessToken: string): Promise<CognitoUser> => {
  return await cognitoService.getUserDetails(accessToken);
};

const verifyAccessToken = async (accessToken: string): Promise<CognitoUser> => {
  return await cognitoService.verifyAccessToken(accessToken);
};

// Legacy method for compatibility - now uses access token instead of JWT
const verifyToken = async (token: string): Promise<{ user_id: string }> => {
  try {
    const user = await verifyAccessToken(token);
    return { user_id: user.user_id };
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const authService = {
  register,
  confirmSignUp,
  login,
  getProfile,
  verifyAccessToken,
  verifyToken, // Legacy compatibility
};
