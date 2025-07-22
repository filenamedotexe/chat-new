-- Seed data for development
-- Default admin password: admin123 (hashed)
-- Default user password: user123 (hashed)

-- Insert default admin user
INSERT INTO users (email, name, password_hash, role) VALUES
  ('admin@example.com', 'Admin User', '$2a$12$mlpI6X0CPiey3KGLA7NDG.C9/.2L3t7UmkbzGLPmjy75fx5J5okR6', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default regular user
INSERT INTO users (email, name, password_hash, role) VALUES
  ('user@example.com', 'Regular User', '$2a$12$qnMVe9X/Ih65fBmA/XkM7ukDLGpfKSfZvsfEn385LSqDps7gbINbe', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert default features
INSERT INTO features (name, description, enabled) VALUES
  ('chat', 'Enable AI chat functionality', true),
  ('darkMode', 'Enable dark mode theme', true),
  ('betaFeatures', 'Enable beta features', false)
ON CONFLICT (name) DO NOTHING;