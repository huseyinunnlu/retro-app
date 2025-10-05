# Getting Started

This guide will help you set up the Retro App development environment and run the application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** 1.0.0 or higher
- **Git** for version control
- **Node.js** (optional, for compatibility with some tools)
- A **Supabase** account (free tier works)
- A code editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd retro-app
```

### 2. Install Dependencies

This project uses **Bun** as the package manager and runtime:

```bash
bun install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Note your project URL and anon key from Project Settings → API

#### Set Up Database Tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create retro_templates table
CREATE TABLE retro_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  template_columns JSON NOT NULL,
  cover_url TEXT,
  background_color TEXT,
  category_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create retros table
CREATE TABLE retros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled Retro',
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES retro_templates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create retro_comments table
CREATE TABLE retro_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID REFERENCES retros(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  comment TEXT DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their team"
  ON teams FOR SELECT
  USING (id = (auth.jwt()->>'user_metadata')::json->>'team_id');

CREATE POLICY "Users can view their team's retros"
  ON retros FOR ALL
  USING (team_id = (auth.jwt()->>'user_metadata')::json->>'team_id');

CREATE POLICY "Users can view their team's retro comments"
  ON retro_comments FOR ALL
  USING (
    retro_id IN (
      SELECT id FROM retros
      WHERE team_id = (auth.jwt()->>'user_metadata')::json->>'team_id'
    )
  );

-- Allow public read access to templates
CREATE POLICY "Anyone can view templates"
  ON retro_templates FOR SELECT
  USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE retro_comments;
```

#### Insert Sample Template

```sql
INSERT INTO retro_templates (title, description, template_columns, cover_url)
VALUES (
  'Start, Stop, Continue',
  'A classic retrospective format focusing on what to start doing, stop doing, and continue doing.',
  '[
    {
      "id": "start",
      "title": "Start",
      "description": "What should we start doing?",
      "iconUrl": "/retro-column-icons/startStopContinue-start.png",
      "color": "#10b981"
    },
    {
      "id": "stop",
      "title": "Stop",
      "description": "What should we stop doing?",
      "iconUrl": "/retro-column-icons/startStopContinue-stop.png",
      "color": "#ef4444"
    },
    {
      "id": "continue",
      "title": "Continue",
      "description": "What should we continue doing?",
      "iconUrl": "/retro-column-icons/startStopContinue-continue.png",
      "color": "#3b82f6"
    }
  ]'::json,
  '/retro-template-covers/startStopContinue.png'
);
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with the values from your Supabase project.

### 5. Update Database Types

Generate TypeScript types from your Supabase schema:

```bash
bun supabase gen types typescript --project-id your-project-ref > src/lib/supabase/schema.ts
```

Replace `your-project-ref` with your Supabase project reference ID.

## Running the Application

### Development Server

Start the development server with hot reload:

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

Create an optimized production build:

```bash
bun run build
```

### Start Production Server

Run the production build:

```bash
bun run start
```

The server will start on port 3000 by default.

## Development Workflow

### Project Structure Navigation

Key directories and their purposes:

- **`src/app/`**: Next.js pages and layouts (App Router)
- **`src/components/`**: React components
- **`src/actions/`**: Server Actions for data mutations
- **`src/queries/`**: Client-side queries using TanStack Query
- **`src/contexts/`**: React Context providers
- **`src/lib/`**: Utilities, Supabase clients, and configurations

### Code Style

The project uses:

- **ESLint** for linting
- **Prettier** for code formatting

Run linting:

```bash
bun run lint
```

### TypeScript

All code is written in TypeScript with strict mode enabled. Check types:

```bash
bun tsc --noEmit
```

## Common Development Tasks

### Adding a New Page

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Export a default React component

Example:

```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page Content</div>
}
```

### Creating a Server Action

1. Add a function to `src/actions/`
2. Mark it with `'use server'`
3. Use the server-side Supabase client

Example:

```typescript
// src/actions/my-action.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function myAction() {
    const supabase = await createClient()
    // Your logic here
}
```

### Creating a Client Query

1. Add a query/mutation to `src/queries/`
2. Use TanStack Query hooks
3. Import in your component

Example:

```typescript
// src/queries/my-query.ts
import { useMutation } from '@tanstack/react-query'
import supabase from '@/lib/supabase/client'

export function useMyMutation() {
    return useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('my_table')
                .insert(data)

            if (error) throw error
            return result
        },
    })
}
```

### Adding a New Component

1. Create a new file in `src/components/`
2. Use TypeScript for props
3. Follow the naming convention (PascalCase)

Example:

```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun run dev
```

### Supabase Connection Issues

1. Verify your `.env.local` file has correct values
2. Check that your Supabase project is active
3. Ensure you're using the correct project URL and anon key
4. Check the browser console for detailed error messages

### Type Errors After Schema Changes

Regenerate types after modifying the database:

```bash
bun supabase gen types typescript --project-id your-project-ref > src/lib/supabase/schema.ts
```

### Build Errors

Clear the Next.js cache:

```bash
rm -rf .next
bun run build
```

## Next Steps

Now that your development environment is set up:

1. Review the [Architecture Guide](./03-architecture.md) to understand the system design
2. Read the [Authentication Guide](./04-authentication.md) to understand auth flow
3. Explore the [Data Layer Guide](./05-data-layer.md) for database patterns
4. Check the [Components Guide](./06-components.md) for UI development

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
