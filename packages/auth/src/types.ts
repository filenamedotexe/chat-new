export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'client' | 'team_member';
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: Date;
}

export interface AuthSession {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: string;
  };
  expires: string;
}