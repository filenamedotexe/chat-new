# Chat App - Production-Ready Next.js 14 Shell

A modern, production-grade Next.js 14 application shell with authentication, role-based access control, Neon PostgreSQL integration, and a beautiful UI with theme support.

## Features

- **Next.js 14 App Router** with TypeScript (strict mode)
- **Authentication** with NextAuth.js (email/password, extensible to OAuth)
- **Role-Based Access Control** (admin/user roles)
- **Neon PostgreSQL** database integration
- **Modern UI** with Tailwind CSS and Framer Motion
- **Theme System** with light/dark mode and custom themes
- **Vercel AI SDK** integration with streaming chat UI
- **Feature Flags** system for gradual rollouts
- **Modular Architecture** with internal packages
- **Responsive Design** with mobile-first approach

## Project Structure

```
chat-new/
├── app/                    # Next.js app router pages and layouts
│   ├── (auth)/            # Public auth pages (login, register)
│   ├── (protected)/       # Protected pages (dashboard, admin)
│   └── api/               # API routes
├── components/            # Shared React components
├── features/              # Feature-based modules
├── lib/                   # Core utilities
│   ├── theme/            # Theme system
│   └── features/         # Feature flags
├── packages/              # Internal packages
│   ├── @chat/ui          # UI component library
│   ├── @chat/auth        # Authentication logic
│   ├── @chat/database    # Database utilities
│   └── @chat/shared-types # Shared TypeScript types
└── migrations/            # Database migrations
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

# Optionally, seed with sample data
psql $DATABASE_URL -f migrations/002_seed_data.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Default Credentials

After running the seed script:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

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

## License

MIT