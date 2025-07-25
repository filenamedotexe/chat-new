import { neon } from '@neondatabase/serverless';
import type { User, Session, Feature } from '@chat/shared-types';

const sql = neon(process.env.DATABASE_URL!);

export * from './client';
export * from './schema/auth';
export * from './schema/organizations';
export * from './schema/tasks';
export * from './schema/files';
export * from './schema/communications';
export * from './schema/activity';

export { sql };

export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  enabled_for TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export async function getUser(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, role, created_at, updated_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as User['role'],
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, role, created_at, updated_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as User['role'],
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  };
}

export async function createUser(
  email: string,
  passwordHash: string,
  name?: string,
  role: User['role'] = 'user'
): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, ${role})
    RETURNING id, email, name, role, created_at, updated_at
  `;
  
  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as User['role'],
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  };
}

export async function getSession(token: string): Promise<Session | null> {
  const result = await sql`
    SELECT id, user_id, session_token, expires
    FROM sessions
    WHERE session_token = ${token} AND expires > CURRENT_TIMESTAMP
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const session = result[0];
  return {
    id: session.id,
    userId: session.user_id,
    sessionToken: session.session_token,
    expires: new Date(session.expires)
  };
}

export async function createSession(userId: string, token: string, expires: Date): Promise<Session> {
  const result = await sql`
    INSERT INTO sessions (user_id, session_token, expires)
    VALUES (${userId}, ${token}, ${expires})
    RETURNING id, user_id, session_token, expires
  `;
  
  const session = result[0];
  return {
    id: session.id,
    userId: session.user_id,
    sessionToken: session.session_token,
    expires: new Date(session.expires)
  };
}

export async function deleteSession(token: string): Promise<void> {
  await sql`
    DELETE FROM sessions
    WHERE session_token = ${token}
  `;
}

export async function getFeature(name: string): Promise<Feature | null> {
  const result = await sql`
    SELECT id, name, description, enabled, enabled_for, created_at, updated_at
    FROM features
    WHERE name = ${name}
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const feature = result[0];
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    enabled: feature.enabled,
    enabledFor: feature.enabled_for,
    createdAt: new Date(feature.created_at),
    updatedAt: new Date(feature.updated_at)
  };
}

export async function isFeatureEnabled(name: string, userId?: string): Promise<boolean> {
  const feature = await getFeature(name);
  if (!feature) return false;
  
  if (feature.enabled) return true;
  
  if (userId && feature.enabledFor?.includes(userId)) {
    return true;
  }
  
  return false;
}

export async function createFeature(data: {
  name: string;
  description?: string;
  enabled?: boolean;
  enabledFor?: string[];
}): Promise<Feature> {
  const result = await sql`
    INSERT INTO features (name, description, enabled, enabled_for)
    VALUES (${data.name}, ${data.description || null}, ${data.enabled || false}, ${data.enabledFor || []})
    RETURNING id, name, description, enabled, enabled_for, created_at, updated_at
  `;
  
  const feature = result[0];
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    enabled: feature.enabled,
    enabledFor: feature.enabled_for,
    createdAt: new Date(feature.created_at),
    updatedAt: new Date(feature.updated_at)
  };
}

export async function updateFeature(
  name: string,
  data: {
    description?: string;
    enabled?: boolean;
    enabledFor?: string[];
  }
): Promise<Feature | null> {
  const result = await sql`
    UPDATE features
    SET 
      description = COALESCE(${data.description}, description),
      enabled = COALESCE(${data.enabled}, enabled),
      enabled_for = COALESCE(${data.enabledFor}, enabled_for),
      updated_at = CURRENT_TIMESTAMP
    WHERE name = ${name}
    RETURNING id, name, description, enabled, enabled_for, created_at, updated_at
  `;
  
  if (result.length === 0) return null;
  
  const feature = result[0];
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    enabled: feature.enabled,
    enabledFor: feature.enabled_for,
    createdAt: new Date(feature.created_at),
    updatedAt: new Date(feature.updated_at)
  };
}

export async function toggleFeature(name: string): Promise<Feature | null> {
  const feature = await getFeature(name);
  if (!feature) return null;
  
  return updateFeature(name, { enabled: !feature.enabled });
}

export async function getAllFeatures(): Promise<Feature[]> {
  const result = await sql`
    SELECT id, name, description, enabled, enabled_for, created_at, updated_at
    FROM features
    ORDER BY name
  `;
  
  return result.map(feature => ({
    id: feature.id,
    name: feature.name,
    description: feature.description,
    enabled: feature.enabled,
    enabledFor: feature.enabled_for,
    createdAt: new Date(feature.created_at),
    updatedAt: new Date(feature.updated_at)
  }));
}