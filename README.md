# Agency Client Platform - Next.js 14 Production App

A complete agency management platform built with Next.js 14, featuring project management, file sharing, task tracking, and real-time collaboration. Currently in Phase 6 of development with comprehensive testing.

> **Quick Start**: Clone → Install → Set up `.env.local` → Run migrations → `npm run dev` → Login with `admin@example.com` / `admin123`

## What's Built So Far

### ✅ Completed Features (Phases 0-6)
- **Authentication System**: Email/password login with role-based access (admin, client, team_member)
- **Organizations**: Full CRUD with client isolation
- **Projects**: Multi-org projects with team assignments
- **Tasks**: Kanban board with drag-drop, status workflows
- **File Management**: Upload, preview, download, cross-project sharing
- **Dashboard**: Role-specific views with quick actions
- **Testing**: Comprehensive Cypress E2E test suite

### 🚧 Coming Next (Phase 8)
- Real-time chat system
- Progress tracking
- Admin analytics

## Key Features

- **Next.js 14 App Router** with Server Components
- **TypeScript** with strict mode for type safety
- **Role-Based Access**: Admin, Client, Team Member roles
- **Drag & Drop**: Smooth Kanban board with Framer Motion
- **File Sharing**: Cross-project file management
- **Real Database**: PostgreSQL via Neon (not SQLite!)
- **Modular Architecture**: Feature-based organization
- **Production Ready**: Error handling, loading states, auth middleware

## Why This Architecture?

This isn't just another boilerplate. It's designed for real agency work:

- **Feature-based structure**: Each feature is self-contained in `/features/`
- **Monorepo packages**: Shared code lives in `@chat/*` packages
- **Real PostgreSQL**: No SQLite compromises, using Neon for production
- **Phased implementation**: Built following a detailed plan (`upgrade.md`)
- **Comprehensive testing**: Every feature has Cypress tests
- **Production patterns**: Error boundaries, loading states, proper auth

## Project Structure

```
agency-client-platform/
├── app/                    # Next.js 14 app router
│   ├── (auth)/            # Public routes (login, register)
│   ├── (protected)/       # Auth-required routes
│   └── api/               # API endpoints
├── features/              # Feature modules (the meat of the app!)
│   ├── auth/             # Authentication components
│   ├── organizations/    # Org management
│   ├── projects/         # Project CRUD
│   ├── tasks/            # Kanban board & tasks
│   └── files/            # File upload & sharing
├── packages/              # Internal packages (monorepo)
│   ├── @chat/ui          # Reusable UI components
│   ├── @chat/auth        # Auth utilities
│   ├── @chat/database    # Database schema & client
│   └── @chat/shared-types # TypeScript types
├── lib/                   # Core utilities
├── cypress/e2e/          # E2E tests (all passing!)
└── migrations/           # SQL migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database
- OpenAI API key (for AI chat features)

### 1. Clone and Install

```bash
git clone <repository-url>
cd chat-new
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://username:password@your-neon-database.neon.tech/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# OpenAI (for chat features)
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_NAME=Chat App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the migrations to set up your database schema:

```bash
# Using psql
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_seed_data.sql
psql $DATABASE_URL -f migrations/003_add_files_table.sql

# Or push schema using Drizzle (requires env setup)
npm run db:push
```

### 4. Create Upload Directory

```bash
mkdir -p public/uploads
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

> **Note**: If port 3000 is busy, the server will use 3001. Check the console output!

## Default Credentials

After running the seed script:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push database schema changes

## Authentication

The app uses NextAuth.js with the following features:
- Email/password authentication
- Session management with JWT
- Role-based access control (admin/user)
- Protected routes with middleware

## Theme System

The app includes a sophisticated theme system:
- **Light/Dark mode** with system preference detection
- **Custom themes**: Ocean, Forest
- **CSS variables** for easy customization
- **Theme persistence** in localStorage

## UI Components

The `@chat/ui` package includes:
- Button (with loading states)
- Card (with hover effects)
- Input (with error states)
- Avatar
- Dropdown
- ThemeToggle
- ChatBubble
- Layout components

## Feature Flags

Control feature availability with the built-in feature flag system:

```typescript
import { FeatureFlag, FEATURES } from '@/lib/features';

<FeatureFlag feature={FEATURES.CHAT}>
  <ChatInterface />
</FeatureFlag>
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY` - Your OpenAI API key

## Security Considerations

- Always use HTTPS in production
- Keep `NEXTAUTH_SECRET` secure and unique
- Use environment variables for sensitive data
- Enable Neon's connection pooling for production
- Implement rate limiting for API routes
- Regular security updates for dependencies

## Extending the App

### Adding New Features

1. Create a new directory in `features/`
2. Add pages, components, and API routes
3. Use the internal packages for shared functionality

### Adding OAuth Providers

Update `packages/auth/src/index.ts`:

```typescript
import GoogleProvider from "next-auth/providers/google";

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... existing providers
]
```

### Custom Themes

Add new themes in `lib/theme/themes.ts`:

```typescript
export const customTheme: Theme = {
  name: 'custom',
  colors: {
    // ... your color values
  }
};
```

## Testing

The project uses Cypress for end-to-end testing.

### Running Tests

```bash
# Start the development server first
npm run dev

# In another terminal, run all tests
npx cypress run

# Or open Cypress UI for interactive testing
npx cypress open
```

### Test Coverage

- Authentication flows (login, register, logout)
- Role-based access control
- Organization and Project CRUD operations
- Task management with Kanban board
- File upload and management
- Cross-project file sharing

### Writing Tests

See `CLAUDE.md` for detailed testing guidelines and common issues.

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 3000 is in use, the dev server will use 3001. Update `cypress.config.js` accordingly.

2. **Database errors**: Ensure all migrations have been run. Check for missing tables with:
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```

3. **Authentication issues**: Clear browser cookies or use incognito mode when testing auth flows.

4. **File upload errors**: Ensure `/public/uploads` directory exists and is writable.

## Quick Development Tips

### First Time Setup Checklist
```bash
# 1. Install dependencies
npm install

# 2. Copy env example
cp .env.example .env.local  # Edit with your database URL

# 3. Run all migrations in order
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_seed_data.sql
psql $DATABASE_URL -f migrations/003_add_files_table.sql

# 4. Create uploads directory
mkdir -p public/uploads

# 5. Start dev server
npm run dev

# 6. Run tests to verify
npm run test:e2e
```

### Common Workflows

#### Adding a New Feature
1. Create feature directory: `/features/your-feature/`
2. Add components, data layer, and types
3. Create page in `/app/(protected)/your-feature/page.tsx`
4. Add navigation link in sidebar
5. Write Cypress tests
6. Update `upgrade.md` with progress

#### Testing Your Changes
```bash
# Quick test for specific phase
npm run cypress:phase6  # or phase1-2, phase3, etc.

# Test everything
npm run test:e2e

# Debug with UI
npm run test:e2e:open
```

#### Debugging Issues
```bash
# Type errors?
npm run typecheck

# Build errors?
npm run build

# Database issues?
psql $DATABASE_URL -c "\dt"  # List all tables

# Port conflicts?
lsof -i :3000  # See what's using port 3000
```

### Project Conventions

- **File naming**: `kebab-case.tsx` for files, `PascalCase` for components
- **Imports**: Use `@/` for app code, `@chat/` for packages
- **Types**: Export from feature folders or `@chat/shared-types`
- **API Routes**: Always check auth with `const session = await auth()`
- **Client Components**: Add `'use client'` directive when using hooks/events
- **Testing**: Add `data-testid` to all interactive elements

### VS Code Recommended Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma (for database schema)
- GitLens
- Error Lens

### Deployment Notes

This app is ready for Vercel deployment:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy (automatic builds on push)

### Contributing

1. Check `upgrade.md` for current phase and planned features
2. Create feature branch from `main`
3. Follow existing patterns in codebase
4. Write tests for new features
5. Update documentation

## License

MIT