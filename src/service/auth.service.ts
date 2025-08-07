interface RegisterData {
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

const register = async (data: RegisterData): Promise<User> => {
  const { name, email } = data;
  
  // Mock user creation (in real app this would save to database)
  const user: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    created_at: new Date()
  };

  // TODO: Add email validation, duplicate check, etc.
  // TODO: Send registration email
  
  return user;
};

export const authService = {
  register,
};
