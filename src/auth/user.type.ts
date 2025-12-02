export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: 'USER' | 'ADMIN';
  created_at: Date;
  updated_at: Date;
}

export interface LoginResponse {
  accessToken?: string;
  user: User;
}
