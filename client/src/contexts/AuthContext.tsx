import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../services/auth.service";
import {
  User,
  LoginCredentials,
  RegisterData,
  ConfirmationData,
  AuthState,
} from "../types/auth.types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  confirmEmail: (data: ConfirmationData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth data on mount
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const storedTokens = authService.getStoredTokens();

        if (storedUser && storedTokens) {
          // Verify token is still valid by fetching profile
          const profileResponse = await authService.getProfile();
          setAuthState({
            user: profileResponse.data,
            tokens: storedTokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // Token is invalid or expired
        authService.logout();
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, accessToken, idToken, refreshToken } = response.data;

      const tokens = { accessToken, idToken, refreshToken };
      authService.saveAuthData(user, tokens);

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      toast.success(
        "Registration successful! Please check your email for verification code. For testing, use confirmation code: 123456"
      );
      navigate("/confirm", { state: { email: data.email } });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Registration failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const confirmEmail = async (data: ConfirmationData) => {
    try {
      await authService.confirmEmail(data);
      toast.success("Email confirmed successfully! Please login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Email confirmation failed");
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const refreshAuth = async () => {
    try {
      const profileResponse = await authService.getProfile();
      setAuthState((prev) => ({
        ...prev,
        user: profileResponse.data,
      }));
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        confirmEmail,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
