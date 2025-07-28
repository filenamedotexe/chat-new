# Agency Client Platform - Supabase-Powered Production App

A complete agency management platform built with Next.js 14 and Supabase, featuring project management, file sharing, task tracking, real-time collaboration, and a comprehensive support chat system.

> **Quick Start**: Clone → Install → Set up `.env.local` → Run migrations → `npm run dev` → Login with `admin@test.com` / `password123`

## What's Built

### ✅ Core Features
- **Supabase Authentication**: Email/password login with role-based access (admin, client, team_member)
- **Organizations**: Full CRUD with client isolation
- **Projects**: Multi-org projects with team assignments
- **Tasks**: Kanban board with drag-drop, status workflows, and comment system
- **File Management**: Supabase Storage integration with cross-project sharing
- **Support Chat**: Real-time customer support with floating widget and admin dashboard
- **Dashboard**: Role-specific views with quick actions
- **Testing**: Playwright E2E test suite (migrated from Cypress)

### 🏗️ Architecture Highlights
- **Next.js 14 App Router** with Server Components
- **Supabase Backend**: Auth, Database (PostgreSQL), Storage, and Realtime
- **TypeScript** with strict mode for type safety
- **Modular Architecture**: Feature-based organization in `/features/`
- **Server-Sent Events**: Real-time updates without WebSocket complexity
- **Cookie-Based Sessions**: Using @supabase/ssr for secure auth

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth with @supabase/ssr
- **Database**: PostgreSQL via Supabase
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime + SSE for chat
- **UI Library**: Custom component library (@chat/ui)
- **Styling**: Tailwind CSS with custom theme system
- **Testing**: Playwright (E2E)
- **Type Safety**: TypeScript with strict mode
- **Validation**: Zod for runtime validation

## Project Structure

```
agency-client-platform/
├── app/                      # Next.js 14 app router
│   ├── (auth)/              # Public routes (login, register)
│   ├── (protected)/         # Auth-required routes
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── projects/        # Project management
│   │   ├── tasks/           # Task management with comments
│   │   ├── files/           # File management
│   │   └── admin/           # Admin-only areas
│   └── api/                 # API endpoints
│       ├── auth/            # Supabase auth endpoints
│       ├── conversations/   # Support chat API
│       └── files/           # File operations
├── features/                # Feature modules
│   ├── auth/               # Authentication components
│   ├── organizations/      # Org management
│   ├── projects/          # Project CRUD
│   ├── tasks/             # Kanban board & tasks
│   ├── files/             # File upload & sharing
│   └── support-chat/      # Customer support chat
├── lib/                    # Core utilities
│   ├── supabase/          # Supabase client configs
│   ├── auth/              # Auth helpers
│   └── contexts/          # React contexts
├── packages/              # Internal packages (monorepo)
│   ├── @chat/ui          # Reusable UI components
│   ├── @chat/database    # Database schema & types
│   └── @chat/shared-types # Shared TypeScript types
├── tests/                 # Playwright tests
│   └── e2e/              # End-to-end tests
└── migrations/           # SQL migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key (optional, for AI features)

### 1. Clone and Install

```bash
git clone <repository-url>
cd chat-new
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_NAME=Agency Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. **Configure Auth Settings** in Supabase Dashboard:
   - Enable email auth
   - Disable email confirmations (for development)
   - Set Site URL: `http://localhost:3000`
   - Add redirect URLs: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

2. **Run Database Migrations**:
   ```bash
   # Using psql (get connection string from Supabase Dashboard)
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/001_initial_schema.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/002_auth_tables.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/003_add_files_table.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/004_add_user_roles.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/005_auth_improvements.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/006_add_support_chat_tables.sql
   psql "postgresql://postgres:[password]@[host]/postgres" -f migrations/007_fix_message_constraints.sql
   ```

3. **Create Test Users** (for development):
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES 
     (gen_random_uuid(), 'admin@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
     (gen_random_uuid(), 'team@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
     (gen_random_uuid(), 'client@test.com', crypt('password123', gen_salt('bf')), now(), now(), now());
   
   -- Then update their roles in public.users table
   ```

4. **Configure Storage Buckets**:
   - Create a `files` bucket in Supabase Storage
   - Set it to public or configure RLS policies as needed

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Default Test Credentials

For development:
- **Admin**: admin@test.com / password123
- **Team Member**: team@test.com / password123
- **Client**: client@test.com / password123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run Playwright tests
- `npm run test:ui` - Open Playwright UI

## Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Cookie-based session management via @supabase/ssr
- Role-based access control (admin/team_member/client)
- Protected routes with middleware
- Automatic session refresh

## Key Features

### Support Chat System
- **Client Widget**: Floating chat bubble on all pages
- **Real-time Messaging**: Using SSE for instant updates
- **Admin Dashboard**: Conversation management at `/admin/conversations`
- **Internal Notes**: Admin-only notes within conversations
- **File Attachments**: Support for images, PDFs, and documents

### File Management
- **Supabase Storage**: Secure file hosting
- **Cross-Project Sharing**: Share files between projects
- **Preview Support**: Images, PDFs, and text files
- **Role-Based Access**: Control who can upload/view files

### Task Management
- **Kanban Board**: Drag-and-drop task management
- **Comments System**: Discussion threads on tasks
- **Status Workflows**: Customizable task statuses
- **Real-time Updates**: Live status changes

## Theme System

The app includes a sophisticated theme system:
- **Light/Dark mode** with system preference detection
- **Custom themes**: Ocean, Forest  
- **CSS variables** for easy customization
- **Theme persistence** in localStorage

## Testing

### Running Playwright Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts
```

### Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - All Supabase variables from `.env.local`
   - Set `NODE_ENV=production`
4. Deploy

### Railway / Render

Similar process - ensure all environment variables are set and the build command is `npm run build`.

## Security Best Practices

- Always use environment variables for secrets
- Enable RLS (Row Level Security) in Supabase
- Use Supabase service role key only in server-side code
- Implement rate limiting on API routes
- Validate all user inputs with Zod
- Keep dependencies updated

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check Supabase Auth settings
   - Ensure redirect URLs are configured
   - Clear cookies and try again

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check if migrations have been run
   - Ensure Supabase project is active

3. **File Upload Errors**:
   - Check Supabase Storage bucket exists
   - Verify storage policies allow uploads
   - Check file size limits (25MB default)

4. **Real-time Features Not Working**:
   - Ensure Supabase Realtime is enabled
   - Check browser console for WebSocket errors
   - Verify anon key has proper permissions

## Development Tips

### Adding New Features

1. Create feature directory: `/features/your-feature/`
2. Add components, hooks, and types
3. Create API routes if needed
4. Add to navigation/routing
5. Write Playwright tests
6. Update documentation

### Database Changes

1. Create migration file in `/migrations/`
2. Run migration against Supabase
3. Update TypeScript types
4. Test thoroughly

### Performance Optimization

- Use React Server Components by default
- Implement proper loading states
- Use Suspense boundaries
- Optimize images with Next.js Image
- Enable caching where appropriate

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow existing code patterns
4. Write tests for new features
5. Update documentation
6. Submit pull request

## License

MIT