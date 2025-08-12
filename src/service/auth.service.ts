import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import config from "../config/config";
import { BadRequestError, UnauthorizedError } from "../api-response";
import { cognitoClient } from "../database";
import { isLocal, isDev } from "../utils/env.utils";
import CognitoMockService from "../mock/cognito.mock";

// Generate secret hash for Cognito client
const generateSecretHash = (username: string): string => {
  return createHmac("SHA256", config.COGNITO_CLIENT_SECRET)
    .update(username + config.COGNITO_CLIENT_ID)
    .digest("base64");
};

export interface CognitoUser {
  user_id: string;
  email: string;
  preferred_username: string;
  name: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  user: CognitoUser;
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}

export interface RegisterData {
  email: string;
  preferred_username: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const register = async (data: RegisterData): Promise<{ message: string; user_id?: string }> => {
  try {
    // Use mock service for local and development environments
    if (isLocal() || isDev()) {
      return await CognitoMockService.register(data);
    }

    const { email, preferred_username, name, password } = data;

    const secretHash = generateSecretHash(email);

    const command = new SignUpCommand({
      ClientId: config.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "preferred_username",
          Value: preferred_username,
        },
        {
          Name: "name",
          Value: name,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      message: "Registration successful. Please check your email for verification code.",
      user_id: response.UserSub,
    };
  } catch (error: any) {
    console.error("Cognito registration error:", error);

    if (error.name === "UsernameExistsException") {
      throw new BadRequestError("User with this email already exists");
    }

    if (error.name === "InvalidPasswordException") {
      throw new BadRequestError("Password does not meet requirements");
    }

    throw new BadRequestError(error.message || "Registration failed");
  }
};

const confirmSignUp = async (
  email: string,
  confirmationCode: string
): Promise<{ message: string }> => {
  try {
    // Use mock service for local and development environments
    if (isLocal() || isDev()) {
      return await CognitoMockService.confirmSignUp(email, confirmationCode);
    }
    const secretHash = generateSecretHash(email);

    const command = new ConfirmSignUpCommand({
      ClientId: config.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);

    return { message: "Email confirmation successful" };
  } catch (error: any) {
    console.error("Cognito confirmation error:", error);

    if (error.name === "CodeMismatchException") {
      throw new BadRequestError("Invalid confirmation code");
    }

    if (error.name === "ExpiredCodeException") {
      throw new BadRequestError("Confirmation code has expired");
    }

    throw new BadRequestError(error.message || "Email confirmation failed");
  }
};

const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Use mock service for local and development environments
    if (isLocal() || isDev()) {
      return await CognitoMockService.login(data);
    }

    const { email, password } = data;
    const secretHash = generateSecretHash(email);

    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: config.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new UnauthorizedError("Authentication failed");
    }

    const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

    if (!AccessToken) {
      throw new UnauthorizedError("No access token received");
    }

    // Get user details using access token
    const userDetails = await getUserDetails(AccessToken);

    return {
      user: userDetails,
      accessToken: AccessToken,
      idToken: IdToken,
      refreshToken: RefreshToken,
    };
  } catch (error: any) {
    console.error("Cognito login error:", error);

    if (error.name === "NotAuthorizedException") {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (error.name === "UserNotConfirmedException") {
      throw new BadRequestError(
        "User account is not confirmed. Please check your email for verification code."
      );
    }

    if (error.name === "UserNotFoundException") {
      throw new UnauthorizedError("Invalid credentials");
    }

    // If it's already our custom error, re-throw it
    if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
      throw error;
    }

    throw new UnauthorizedError(error.message || "Authentication failed");
  }
};

const getUserDetails = async (accessToken: string): Promise<CognitoUser> => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    if (!response.UserAttributes) {
      throw new UnauthorizedError("Unable to retrieve user details");
    }

    const userAttributes = response.UserAttributes.reduce((acc, attr) => {
      if (attr.Name && attr.Value) {
        acc[attr.Name] = attr.Value;
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      user_id: response.Username || "",
      email: userAttributes.email || "",
      preferred_username: userAttributes.preferred_username || "",
      name: userAttributes.name || "",
      email_verified: userAttributes.email_verified === "true",
    };
  } catch (error: any) {
    console.error("Get user details error:", error);

    if (error.name === "NotAuthorizedException") {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    throw new UnauthorizedError("Unable to retrieve user details");
  }
};

const verifyAccessToken = async (accessToken: string): Promise<CognitoUser> => {
  // Use mock service for local and development environments
  if (isLocal() || isDev()) {
    return await CognitoMockService.verifyAccessToken(accessToken);
  }

  return await getUserDetails(accessToken);
};

export const authService = {
  register,
  confirmSignUp,
  login,
  getUserDetails,
  verifyAccessToken,
};
