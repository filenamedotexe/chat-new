# Test User Credentials

## 🔐 Available Test Users

### 1. Admin User (Full System Access)
- **Email:** `admin@agency.com`
- **Password:** `admin123456`
- **Role:** `admin`
- **Access:** 
  - View all organizations
  - Manage all projects
  - Access admin dashboard
  - Manage users and teams
  - View system statistics

### 2. Client User (Client Portal Access)
- **Email:** `client@example.com`
- **Password:** `client123456`
- **Role:** `client`
- **Access:**
  - View own organization only
  - View assigned projects
  - Approve/reject deliverables
  - Send messages
  - Upload files

### 3. Team Member (Agency Team Access)
- **Email:** `team@agency.com`
- **Password:** `team123456`
- **Role:** `team_member`
- **Access:**
  - View all projects
  - Manage tasks
  - Send messages to clients
  - Upload deliverables
  - View analytics

## Creating Test Users

If these users don't exist in your database yet, you can create them by running:

```bash
npx tsx scripts/create-test-users.ts
```

## Legacy Test Users (from original seed)

The original seed data also includes:
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`

Note: These legacy users may have the wrong role types and should be updated to use the new role system.