# Bookmarker

## New Outlook-Style UI

A modern, responsive UI inspired by Microsoft Outlook has been added to the application. This interface provides an intuitive way to manage bookmarks with the following features:

### Key Features

- **Three-pane layout**: Categories sidebar, bookmark list, and detail view
- **Command bar**: Quick access to common actions like create, edit, delete
- **Responsive design**: Adapts to mobile, tablet, and desktop screens
- **Favorite bookmarks**: Quickly access your most important links
- **Tag organization**: Categorize and filter bookmarks by tags
- **Preview capabilities**: View website screenshots in the detail pane

### How to Access

To use the new UI, simply navigate to `/outlook` in your browser after starting the application.

- Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
   - [Quick Start (Docker)](#quick-start-docker)
   - [Manual Setup](#manual-setup)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [API Routes](#api-routes)
8. [Development Guide](#development-guide)
   - [Available Scripts](#available-scripts)
   - [Adding Components](#adding-components)
   - [Development Phases](#development-phases)
9. [Docker Setup](#docker-setup)
   - [Configuration](#docker-configuration)
   - [Useful Commands](#docker-commands)
   - [Troubleshooting](#docker-troubleshooting)
10. [Deployment](#deployment)
11. [Architecture Decisions](#architecture-decisions)
12. [Security Considerations](#security-considerations)
13. [Performance Optimization](#performance-optimization)
14. [Testing Strategy](#testing-strategy)

---

## Project Overview

Bookmarker is a full-stack bookmark management application built with Next.js, TypeScript, Prisma, and PostgreSQL. It allows users to organize, search, and manage bookmarks with powerful features like tagging, categorization, multiple view modes, and more.

The project has been initialized with all necessary configurations, dependencies, and foundational structure in place, making it ready for development.

---

## Features

- 🔖 **Bookmark Management** - Save, edit, and delete bookmarks with metadata
- 🏷️ **Tags & Categories** - Organize bookmarks with multiple tags and categories
- ⭐ **Favorites** - Mark important bookmarks as favorites for quick access
- 🔍 **Powerful Search** - Full-text search across titles, URLs, descriptions, and tags
- 🎨 **Multiple Views** - Table, cards, and folder tree view modes
- 📊 **Filtering & Sorting** - Advanced filtering and sorting options
- 📄 **Pagination** - Efficient pagination for large collections
- 📤 **Import/Export** - Import and export bookmarks as CSV or JSON
- 🔒 **Authentication** - Secure user authentication with NextAuth.js
- 🎯 **Favicon Fetching** - Automatic favicon retrieval for bookmarks
- 🌐 **Sharing** - Share bookmarks or collections with others
- 📱 **Responsive Design** - Mobile-friendly interface with TailwindCSS

### Bookmark Management
- Auto-fetch metadata (title, favicon) from URLs
- Support for descriptions up to 5000 characters
- Duplicate URL detection with warnings
- Bulk operations (delete, tag, categorize)

### Search & Filtering
- Full-text search across multiple fields
- Advanced filters (category, tags, favorite status, date range)
- Sorting by date, title, or URL
- Server-side pagination for performance

### View Modes
1. **Table View** - Sortable columns with all bookmark details
2. **Cards View** - Visual grid layout with rich previews
3. **Tree View** - Hierarchical organization by categories and tags

### Import/Export
- **Formats**: CSV, JSON, Browser HTML (Netscape format)
- **Features**: Duplicate handling, validation, progress tracking
- **Max file size**: 10MB

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Framework**: Next.js API Routes & Server Actions
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v5

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database or Docker

### Quick Start (Docker)

If you have Docker installed (recommended):

```bash
# Clone the repository
git clone <repository-url>
cd bookmarker

# Install dependencies
npm install

# Generate a secret for NextAuth
openssl rand -base64 32
# Add the secret to your .env.local

# Start everything (PostgreSQL + Next.js)
./start.sh
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

That's it! The script handles database setup, migrations, and starting the dev server.

To stop: `./stop.sh` or press `Ctrl+C`

### Manual Setup

1. **Install Dependencies**

The dependencies should already be installed. If not:
```bash
npm install
```

2. **Set Up PostgreSQL Database**

You have several options for PostgreSQL:

- **Local PostgreSQL**: Install on your machine and create a database
  ```sql
  CREATE DATABASE bookmarker;
  ```

- **Cloud PostgreSQL**: Use a hosted service like Vercel Postgres, Supabase, Railway, or Neon

3. **Configure Environment Variables**

1. Create a `.env.local` file with:
```env
# Database - Replace with your actual PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/bookmarker?schema=public"

# NextAuth - Keep these for local development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-here"

# Application
NODE_ENV="development"
```

2. Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. **Set Up the Database Schema**

Run Prisma migrations:
```bash
npm run prisma:migrate
```

5. **Start the Development Server**
```bash
npm run dev
```

The application will start at **http://localhost:3000**

---

## Project Structure

```
bookmarker/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── bookmarks/        # Bookmark-related components
│   ├── categories/       # Category-related components
│   └── tags/             # Tag-related components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── public/               # Static assets
├── docker-compose.yml    # Docker configuration
├── start.sh              # Start script for development
├── stop.sh               # Stop script for development
└── DOCUMENTATION.md      # This file
```

---

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Bookmark** - Saved bookmarks with metadata
- **Category** - Bookmark categories (one-to-many)
- **Tag** - Bookmark tags (many-to-many)
- **BookmarkTag** - Junction table for bookmark-tag relationships

Relationship overview:

```
User (1) ──────┬─────── (M) Bookmark
               │             │
               │             ├─── (1) Category
               │             │
               │             └─── (M) BookmarkTag (M) ──── Tag
               │
               ├─────── (M) Category
               │
               └─────── (M) Tag
```

See `prisma/schema.prisma` for the complete schema definition.

---

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Bookmarks
- `GET /api/bookmarks` - List bookmarks (with filters, search, pagination)
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks/:id` - Get single bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `PATCH /api/bookmarks/:id/favorite` - Toggle favorite
- `POST /api/bookmarks/import` - Import bookmarks
- `GET /api/bookmarks/export` - Export bookmarks

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

---

## Development Guide

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

#### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

#### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:migrate:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database (if seed file exists)

#### Docker
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View PostgreSQL logs

#### Quick Scripts
- `./start.sh` - Start everything (PostgreSQL + dev server)
- `./stop.sh` - Stop all services

### Adding Components

Use the shadcn/ui CLI to add components:

```bash
# Essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add popover
```

### Development Phases

#### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up authentication pages (login, register)
- [ ] Implement NextAuth.js authentication
- [ ] Create protected route middleware
- [ ] Build basic dashboard layout
- [ ] Add sidebar and header components

#### Phase 2: Core Features (Weeks 3-4)
- [ ] Bookmark CRUD operations
  - [ ] Create bookmark form with URL validation
  - [ ] Fetch metadata (title, favicon)
  - [ ] Edit bookmark functionality
  - [ ] Delete with confirmation
- [ ] Categories management
  - [ ] Create/edit/delete categories
  - [ ] Color picker & icon selector
- [ ] Tags management
  - [ ] Create/edit/delete tags
  - [ ] Tag autocomplete

#### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Search functionality
  - [ ] Full-text search
  - [ ] Advanced filters
- [ ] Multiple view modes
  - [ ] Table view with sorting
  - [ ] Card grid view
  - [ ] Tree folder view
- [ ] Import/Export
  - [ ] CSV import/export
  - [ ] JSON import/export
  - [ ] Browser HTML import

#### Phase 4: Polish (Week 7)
- [ ] Bulk operations
- [ ] Sharing features
- [ ] Performance optimization
- [ ] Testing
- [ ] Bug fixes

#### Phase 5: Deployment (Week 8)
- [ ] Production deployment
- [ ] Database migration to production
- [ ] Environment setup
- [ ] Monitoring

---

## Docker Setup

This project includes Docker Compose configuration for easy local development.

### Docker Configuration

The `docker-compose.yml` file defines:

**PostgreSQL Service:**
- Image: `postgres:16-alpine`
- Port: `5432`
- Database: `bookmarker`
- Username: `bookmarker`
- Password: `bookmarker_password`
- Volume: Persistent data storage

When using Docker Compose, use this connection string in `.env.local`:

```env
DATABASE_URL="postgresql://bookmarker:bookmarker_password@localhost:5432/bookmarker?schema=public"
```

### Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop all services
docker-compose down

# Remove containers and volumes (fresh start)
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it bookmarker-postgres psql -U bookmarker -d bookmarker
```

### Docker Troubleshooting

#### Port 5432 Already in Use

If you have PostgreSQL already running on your machine:

**Option 1: Stop local PostgreSQL**
```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

**Option 2: Use different port**

Edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Changed from 5432:5432
```

Update `.env.local`:
```env
DATABASE_URL="postgresql://bookmarker:bookmarker_password@localhost:5433/bookmarker?schema=public"
```

#### Fresh Database Start

To completely reset your database:

```bash
# Stop and remove everything (including data)
docker-compose down -v

# Start fresh
./start.sh
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Database Hosting

Recommended options:
- Vercel Postgres
- Supabase
- Railway
- AWS RDS

### Deployment Checklist

- [ ] Update environment variables for production
- [ ] Run database migrations on production database
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring (error tracking, analytics)
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Enable compression
- [ ] Set security headers
- [ ] Test production build locally
- [ ] Deploy to Vercel/AWS/Railway

---

## Architecture Decisions

### Frontend Architecture
- **App Router**: Using Next.js 14 App Router for modern routing
- **Server Components**: Default to server components, use "use client" sparingly
- **Data Fetching**: TanStack Query for client-side, Server Actions for mutations
- **State Management**: Zustand for complex client state
- **Forms**: React Hook Form with Zod validation
- **Styling**: TailwindCSS with utility-first approach

### Backend Architecture
- **API Routes**: Next.js API routes for RESTful endpoints
- **Server Actions**: For form submissions and mutations
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js v5 with credentials provider

---

## Security Considerations

- ✅ Password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ HTTP-only cookies
- ✅ Row-level security (userId checks)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React escaping)
- ⚠️ TODO: Implement CSRF protection
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Set up CSP headers

---

## Performance Optimization

- ✅ Database indexes on foreign keys
- ✅ Server-side pagination
- ✅ React Query caching
- ✅ Next.js Image optimization
- ⚠️ TODO: Implement cursor-based pagination
- ⚠️ TODO: Add Redis caching layer
- ⚠️ TODO: Optimize database queries

---

## Testing Strategy

1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Playwright for user flows
4. **Target Coverage**: 80%+

---

Built with ❤️ using Next.js, TypeScript, and Prisma
