# Linksnatched

## Overview
Linksnatched is a link management/bookmarking application. Users can save, organize, tag, and manage web links in a clean dashboard interface. Authentication is handled via Replit Auth (OpenID Connect). Database is hosted on Supabase.

## Recent Changes
- Initial build: Feb 2026
- Migrated database from Replit built-in PostgreSQL to Supabase PostgreSQL
- Schema matches Supabase tables: users (uuid id, email, name, role, plan, status), links (uuid id, user_id FK), subscriptions
- Auth: Replit Auth maps users by email to Supabase users table (stores dbUserId in session)
- Removed favorite functionality (not in Supabase schema)
- Frontend updated to use user.name instead of firstName/lastName

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui, served on port 5000
- **Backend**: Express.js API (same port via Vite middleware)
- **Database**: Supabase PostgreSQL via Drizzle ORM (SUPABASE_DATABASE_URL secret)
- **Auth**: Replit Auth (OpenID Connect) with session storage in Supabase PostgreSQL
  - Users matched by email to Supabase users table
  - Session stores `dbUserId` (Supabase UUID) for link operations
- **Key Files**:
  - `shared/schema.ts` - Data models (links, subscriptions) + re-exports auth models
  - `shared/models/auth.ts` - Auth models (users, sessions) matching Supabase schema
  - `server/db.ts` - Database connection (uses SUPABASE_DATABASE_URL with SSL)
  - `server/routes.ts` - API endpoints for links CRUD
  - `server/storage.ts` - Database CRUD operations for links
  - `server/replit_integrations/auth/` - Auth module (storage, routes, replitAuth)
  - `client/src/pages/landing.tsx` - Landing page for unauthenticated users
  - `client/src/pages/dashboard.tsx` - Main dashboard with links table
  - `client/src/components/app-shell.tsx` - Authenticated layout with header
  - `client/src/components/theme-provider.tsx` - Dark/light mode support

## User Preferences
- Purple gradient branding (from-[#667EEA] to-[#764BA2])
- Clean, modern UI with data table for links
- Dark mode support
- Supabase as database backend
