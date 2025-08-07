import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { BadRequestError, UnauthorizedError } from "../api-response";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

interface PublicUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

interface AuthResponse {
  user: PublicUser;
  token: string;
}

// In-memory user store (replace with database in real app)
const users: User[] = [];

const generateToken = (userId: string): string => {
  return jwt.sign({ user_id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || "7d",
  });
};

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const sanitizeUser = (user: User): PublicUser => {
  const { password, ...publicUser } = user;
  return publicUser as PublicUser;
};

const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  const { name, email, password } = data;
  
  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new BadRequestError("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Save user (in real app this would save to database)
  users.push(user);

  // Generate token
  const token = generateToken(user.id);
  
  return {
    user: sanitizeUser(user),
    token
  };
};

const login = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;
  
  // Find user by email
  const user = findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Update last login (in real app)
  user.updated_at = new Date();

  // Generate token
  const token = generateToken(user.id);
  
  return {
    user: sanitizeUser(user),
    token
  };
};

const getProfile = async (userId: string): Promise<PublicUser> => {
  const user = findUserById(userId);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return sanitizeUser(user);
};

const verifyToken = async (token: string): Promise<{ user_id: string }> => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { user_id: string };
    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
};

export const authService = {
  register,
  login,
  getProfile,
  verifyToken,
  findUserById,
};
