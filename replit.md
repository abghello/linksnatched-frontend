# Linksnatched

## Overview
Linksnatched is a link management/bookmarking application. Users can save, organize, tag, and manage web links in a clean dashboard interface. Authentication is handled via Supabase Auth (email/password). Database is hosted on Supabase.

## Recent Changes
- Initial build: Feb 2026
- Migrated database from Replit built-in PostgreSQL to Supabase PostgreSQL
- Migrated auth from Replit Auth (OpenID Connect) to Supabase Auth (email/password)
- Schema matches Supabase tables: users (uuid id, email, name, role, plan, status), links (uuid id, user_id FK), subscriptions
- Auth: Supabase Auth for email/password login, maps users by email to Supabase users table (stores dbUserId in session)
- Frontend auth page at /auth with login/signup toggle
- Frontend updated to use user.name instead of firstName/lastName

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui, served on port 5000
- **Backend**: Express.js API (same port via Vite middleware)
- **Database**: Supabase PostgreSQL via Drizzle ORM (SUPABASE_DATABASE_URL secret)
- **Auth**: Supabase Auth (email/password) with session storage in Supabase PostgreSQL
  - POST /api/auth/signup - create account via Supabase Auth + local users table
  - POST /api/auth/login - authenticate via Supabase Auth, set express-session
  - POST /api/auth/logout - destroy session
  - GET /api/auth/user - get current user from DB (requires session)
  - Session stores `dbUserId` (Supabase UUID) for link operations
- **Key Files**:
  - `shared/schema.ts` - Data models (links, subscriptions) + re-exports auth models
  - `shared/models/auth.ts` - Auth models (users, sessions) matching Supabase schema
  - `server/db.ts` - Database connection (uses SUPABASE_DATABASE_URL with SSL)
  - `server/supabaseClient.ts` - Supabase client for auth (auto-resolves URL from DB connection)
  - `server/routes.ts` - API endpoints for links CRUD
  - `server/storage.ts` - Database CRUD operations for links
  - `server/replit_integrations/auth/` - Auth module (storage, routes, session setup)
  - `client/src/pages/auth.tsx` - Login/signup page with email/password
  - `client/src/pages/landing.tsx` - Landing page for unauthenticated users
  - `client/src/pages/dashboard.tsx` - Main dashboard with links table
  - `client/src/components/app-shell.tsx` - Authenticated layout with header
  - `client/src/components/theme-provider.tsx` - Dark/light mode support

## Vercel Deployment
- `api/index.ts` - Vercel serverless function wrapping Express app (all `/api/*` routes)
- `vercel.json` - Build config, routing rewrites for API and SPA
- Build outputs frontend to `dist/public/` (Vercel's `outputDirectory`)
- Vercel environment variables needed: `SUPABASE_DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SESSION_SECRET`
- Sessions stored in Supabase PostgreSQL via connect-pg-simple (works in serverless)

## User Preferences
- Purple gradient branding (from-[#667EEA] to-[#764BA2])
- Clean, modern UI with data table for links
- Dark mode support
- Supabase as database backend
- Deploys to Vercel (GitHub repo: abghello/linksnatched-frontend)
