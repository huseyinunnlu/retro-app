# Technical Overview

## Introduction

Retro App is a modern, real-time retrospective meeting management application built with Next.js 15, Supabase, and TypeScript. It enables teams to conduct structured retrospective sessions with customizable templates, real-time collaboration, and drag-and-drop functionality.

## Project Vision

The application aims to streamline team retrospective meetings by providing:

- **Real-time Collaboration**: Multiple team members can add and move comments simultaneously
- **Template-based Workflow**: Pre-defined templates (e.g., Start/Stop/Continue) guide the retrospective structure
- **Team Management**: Secure team-based access with invite tokens
- **Modern UX**: Clean, intuitive interface with drag-and-drop interactions

## Key Features

### 1. Authentication & Team Management

- Secure authentication via Supabase Auth
- Team-based access control
- Invite token system for team onboarding
- User metadata storage for team associations

### 2. Retrospective Management

- Create retros with customizable templates
- Multiple template support (Start/Stop/Continue, etc.)
- Template-based column structure
- Retro history and archival

### 3. Real-time Collaboration

- WebSocket-based real-time updates via Supabase Realtime
- Live comment additions, updates, and deletions
- Drag-and-drop comment reordering between columns
- Optimistic UI updates for smooth user experience

### 4. Comments System

- Add comments to specific columns
- Edit and delete your own comments
- Move comments between columns with drag-and-drop
- Real-time synchronization across all connected clients

## Technology Stack

### Frontend

- **Next.js 15.5.2**: React framework with App Router
- **React 19.1.0**: UI library with Server Components support
- **TypeScript**: Type-safe development
- **TailwindCSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **React Hook Form**: Form state management with Zod validation
- **TanStack Query**: Server state management and caching
- **React DnD**: Drag-and-drop functionality

### Backend & Infrastructure

- **Supabase**: Backend-as-a-Service
    - PostgreSQL database
    - Real-time subscriptions
    - Authentication
    - Row Level Security (RLS)
- **Bun**: JavaScript runtime and package manager

### Developer Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Architecture Overview

The application follows a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Contexts   │     │
│  │ (App Router) │  │    (UI)      │  │  (State)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Queries    │  │   Actions    │  │  Middleware  │
│  (Client)    │  │  (Server)    │  │   (Auth)     │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │   Supabase Backend   │
               │  ┌───────────────┐   │
               │  │   PostgreSQL  │   │
               │  ├───────────────┤   │
               │  │     Auth      │   │
               │  ├───────────────┤   │
               │  │   Realtime    │   │
               │  └───────────────┘   │
               └──────────────────────┘
```

## Project Structure

```
retro-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages (login, register)
│   │   ├── (main)/              # Main application (dashboard, retro pages)
│   │   └── layout.tsx           # Root layout
│   │
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts              # Authentication actions
│   │   └── retro.ts             # Retro CRUD actions
│   │
│   ├── queries/                  # Client-side queries (TanStack Query)
│   │   ├── auth.ts              # Auth queries and mutations
│   │   └── retro.ts             # Retro queries and mutations
│   │
│   ├── components/               # React components
│   │   ├── Auth/                # Authentication forms
│   │   ├── Retro/               # Retro-related components
│   │   ├── RetroCreate/         # Retro creation flow
│   │   ├── Layouts/             # Layout components
│   │   ├── Shared/              # Shared utilities
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── contexts/                 # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── RetroContext.tsx     # Retro state and real-time updates
│   │
│   ├── lib/                      # Utilities and configurations
│   │   ├── supabase/            # Supabase clients and schema
│   │   ├── constants.ts         # Application constants
│   │   └── utils.ts             # Helper functions
│   │
│   └── middleware.ts             # Next.js middleware for route protection
│
├── public/                       # Static assets
├── docs/                         # Documentation
└── .cursor/                      # Cursor AI rules
```

## Database Schema

### Tables

**teams**

- `id`: UUID (Primary Key)
- `name`: Text
- `invite_token`: Text (unique)
- `created_at`: Timestamp

**retros**

- `id`: UUID (Primary Key)
- `name`: Text
- `team_id`: UUID (Foreign Key → teams)
- `template_id`: UUID (Foreign Key → retro_templates)
- `created_at`: Timestamp

**retro_templates**

- `id`: UUID (Primary Key)
- `title`: Text
- `description`: Text
- `template_columns`: JSON (array of column definitions)
- `cover_url`: Text
- `background_color`: Text
- `category_id`: UUID
- `created_at`: Timestamp

**retro_comments**

- `id`: UUID (Primary Key)
- `retro_id`: UUID (Foreign Key → retros)
- `column_id`: Text
- `comment`: Text
- `user_id`: UUID
- `created_at`: Timestamp

### Relationships

- A **team** has many **retros**
- A **retro** belongs to one **team** and one **template**
- A **retro** has many **comments**
- A **template** defines the structure (columns) for retros

## Core Concepts

### Server vs Client Components

The application leverages Next.js App Router's hybrid rendering:

**Server Components** (default):

- Page layouts
- Initial data fetching
- SEO-critical content
- Reduced JavaScript bundle size

**Client Components** (`'use client'`):

- Interactive UI elements
- Forms with validation
- Real-time subscriptions
- Context providers

### Data Flow

1. **Initial Load**: Server Components fetch data via Server Actions
2. **Client Hydration**: Data passed to Client Components via props
3. **User Interactions**: Client Components use TanStack Query mutations
4. **Real-time Updates**: Supabase Realtime broadcasts changes to all clients
5. **Optimistic Updates**: UI updates immediately, syncs with server in background

### Authentication Flow

1. User visits protected route
2. Middleware checks authentication status
3. Redirects to `/login` if not authenticated
4. After login, `initUserData()` fetches user and team
5. `AuthContext` provides user data to all components
6. Supabase client maintains session

### Real-time Synchronization

Retro comments use Supabase Realtime:

```typescript
supabase
    .channel('schema-db-changes')
    .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'retro_comments',
            filter: `retro_id=eq.${retroId}`,
        },
        (payload) => {
            // Handle INSERT, UPDATE, DELETE events
        },
    )
    .subscribe()
```

## Development Philosophy

1. **Type Safety**: Full TypeScript coverage with strict mode
2. **Server-First**: Leverage Server Components for better performance
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Real-time by Default**: Optimistic updates with real-time sync
5. **Component Composition**: Small, reusable components
6. **Separation of Concerns**: Clear boundaries between data, logic, and UI

## Performance Considerations

- **Server Components**: Reduced client-side JavaScript
- **Streaming**: Suspense boundaries for progressive rendering
- **Optimistic Updates**: Instant UI feedback
- **Query Caching**: TanStack Query reduces redundant requests
- **Code Splitting**: Automatic route-based splitting
- **Bun**: Fast package management and runtime

## Security

- **Row Level Security (RLS)**: Supabase policies enforce team-based access
- **Middleware Protection**: Routes guarded at edge
- **Team Isolation**: Users only access their team's data
- **Invite Tokens**: Secure team onboarding
- **Environment Variables**: Sensitive data in `.env.local`

## Next Steps

- [Getting Started Guide](./02-getting-started.md)
- [Architecture Deep Dive](./03-architecture.md)
- [Authentication System](./04-authentication.md)
- [Data Layer](./05-data-layer.md)
- [Components Guide](./06-components.md)
- [Deployment](./07-deployment.md)
