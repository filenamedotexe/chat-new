-- Create test users if they don't exist
INSERT INTO users (id, email, name, password, role, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'team@example.com', 'Team Member', '$2a$10$K7L1OJ1Jz8M0qVZ0QW.hOuAJpJZ7F1y7NfJZ7F1y7NfJZ7F1y7NfJ', 'team_member', NOW(), NOW()),
  (gen_random_uuid(), 'client@example.com', 'Client User', '$2a$10$K7L1OJ1Jz8M0qVZ0QW.hOuAJpJZ7F1y7NfJZ7F1y7NfJZ7F1y7NfJ', 'client', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Note: The password hash is for 'team123' and 'client123' respectively