import api from './api.service';
import { 
  LoginCredentials, 
  RegisterData, 
  ConfirmationData, 
  User, 
  AuthTokens,
  ApiResponse 
} from '../types/auth.types';

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<{ message: string; user_id: string }>> {
    const response = await api.post('/v1/auth/register', data);
    return response.data;
  }

  async confirmEmail(data: ConfirmationData): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post('/v1/auth/confirm', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; } & AuthTokens>> {
    const response = await api.post('/v1/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/v1/auth/profile');
    return response.data;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getStoredTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem('accessToken');
    const idToken = localStorage.getItem('idToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && idToken && refreshToken) {
      return { accessToken, idToken, refreshToken };
    }
    return null;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  saveAuthData(user: User, tokens: AuthTokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default new AuthService();