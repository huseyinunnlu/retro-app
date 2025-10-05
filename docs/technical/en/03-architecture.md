# Architecture Deep Dive

This document provides an in-depth look at the Retro App's architecture, design decisions, and system components.

## High-Level Architecture

The application follows a modern, server-first architecture leveraging Next.js 15's App Router and React Server Components:

```
┌───────────────────────────────────────────────────────┐
│                    Browser Client                     │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌───────────────────────────┐  │
│  │ Server Component│  │   Client Component        │  │
│  │  - Initial SSR  │  │  - Interactivity          │  │
│  │  - SEO Content  │  │  - Forms, DnD             │  │
│  │  - Data Fetch   │  │  - Realtime Updates       │  │
│  └─────────────────┘  └───────────────────────────┘  │
│           │                      │                     │
│           └──────────┬───────────┘                     │
└──────────────────────┼─────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Queries  │  │ Actions  │  │Middleware│
   │(TanStack)│  │ (Server) │  │  (Edge)  │
   └──────────┘  └──────────┘  └──────────┘
         │             │             │
         └─────────────┴─────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │   REST   │  │   Auth   │  │ Realtime │
   │   API    │  │  Service │  │WebSocket │
   └──────────┘  └──────────┘  └──────────┘
         │             │             │
         └─────────────┴─────────────┘
                       │
                       ▼
            ┌────────────────────┐
            │  Supabase Backend  │
            │  ┌──────────────┐  │
            │  │  PostgreSQL  │  │
            │  └──────────────┘  │
            └────────────────────┘
```

## Rendering Strategy

### Server Components (RSC)

**When to Use:**

- Pages and layouts
- Initial data fetching
- SEO-critical content
- Static or rarely changing UI

**Benefits:**

- Zero JavaScript to the client
- Direct database access
- Better SEO
- Faster initial load

**Example:**

```typescript
// src/app/(main)/(dashboard)/page.tsx
import { initUserData } from '@/actions/auth'
import { getRetrosByTeamId } from '@/actions/retro'

export default async function DashboardPage() {
  const { team } = await initUserData()
  const { data: retros } = await getRetrosByTeamId(team.id)

  return <RetroBoardsList retros={retros} />
}
```

### Client Components

**When to Use:**

- Interactive elements (buttons, forms)
- Hooks (useState, useEffect, useContext)
- Browser APIs (window, localStorage)
- Third-party libraries requiring client-side execution
- Real-time subscriptions

**Benefits:**

- Full interactivity
- Client-side state management
- Real-time updates
- Optimistic UI

**Example:**

```typescript
'use client'

import { useRetroContext } from '@/contexts/RetroContext'

export function CommentsList() {
  const { retroComments } = useRetroContext()

  return (
    <div>
      {retroComments.map(comment => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
```

## Data Flow Patterns

### 1. Server-Side Data Fetching

```typescript
// Page (Server Component)
async function Page() {
  const data = await fetchData() // Runs on server
  return <ClientComponent data={data} />
}
```

**Flow:**

1. Request hits the server
2. Server Component executes
3. Data fetched from Supabase
4. HTML generated with data
5. Sent to client with props

### 2. Client-Side Mutations

```typescript
// Component (Client Component)
'use client'

function Form() {
    const mutation = useMutation({
        mutationFn: async (data) => {
            return await supabase.from('table').insert(data)
        },
    })

    const handleSubmit = (data) => {
        mutation.mutate(data)
    }
}
```

**Flow:**

1. User interacts with form
2. Client-side validation (Zod + React Hook Form)
3. Mutation function called
4. Request sent to Supabase
5. Response updates cache
6. UI re-renders

### 3. Real-Time Subscriptions

```typescript
// Context Provider (Client Component)
'use client'

useEffect(() => {
  const channel = supabase
    .channel('changes')
    .on('postgres_changes', { ... }, (payload) => {
      // Update local state
      setState(newState)
    })
    .subscribe()

  return () => channel.unsubscribe()
}, [])
```

**Flow:**

1. Component mounts
2. WebSocket connection established
3. Subscribed to specific table/filters
4. Database changes trigger callback
5. Local state updated
6. UI re-renders automatically

## Routing Architecture

### Route Organization

```
app/
├── (auth)/              # Public auth routes
│   ├── login/
│   └── register/
├── (main)/              # Protected routes
│   ├── (dashboard)/     # Dashboard page
│   └── (retro)/         # Retro pages
│       └── retro/[id]/
└── layout.tsx           # Root layout
```

### Route Groups

Route groups `(name)` allow logical organization without affecting URLs:

- `(auth)`: Public authentication pages
- `(main)`: Protected application pages
- `(dashboard)`: Dashboard-specific layout
- `(retro)`: Retro-specific layout

### Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = publicRoutes.includes(request.nextUrl.pathname)

    // Redirect logic
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (!user && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}
```

**Protection Layers:**

1. **Edge Middleware**: First line of defense
2. **Layout Guards**: Server-side checks in layouts
3. **RLS Policies**: Database-level security

## State Management Strategy

### Server State (TanStack Query)

Used for data from Supabase:

```typescript
// src/queries/retro.ts
export function useRetros(teamId: string) {
    return useQuery({
        queryKey: ['retros', teamId],
        queryFn: async () => {
            const { data } = await getRetrosByTeamId(teamId)
            return data
        },
    })
}
```

**Features:**

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

### Client State (React Context)

Used for UI state and real-time data:

```typescript
// src/contexts/RetroContext.tsx
export function RetroContextProvider({ children, retroData }) {
  const [retroComments, setRetroComments] = useState(retroData.retro_comments)

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', { ... }, (payload) => {
        setRetroComments(current => [...current, payload.new])
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [])

  return (
    <RetroContext.Provider value={{ retroComments }}>
      {children}
    </RetroContext.Provider>
  )
}
```

**Use Cases:**

- Real-time synchronized data
- Shared UI state across components
- WebSocket connection management

### Form State (React Hook Form)

Used for form inputs and validation:

```typescript
const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
        name: '',
        email: '',
    },
})
```

**Features:**

- Schema validation (Zod)
- Error handling
- Optimized re-renders
- TypeScript integration

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐
│    teams     │
├──────────────┤
│ id (PK)      │──┐
│ name         │  │
│ invite_token │  │
└──────────────┘  │
                  │
                  │ 1:N
                  │
                  ▼
            ┌──────────────┐
            │    retros    │
            ├──────────────┤
            │ id (PK)      │──┐
            │ name         │  │
            │ team_id (FK) │  │
            │ template_id  │  │
            └──────────────┘  │
                  │           │
                  │           │ 1:N
                  │           │
                  │           ▼
                  │     ┌──────────────────┐
                  │     │ retro_comments   │
                  │     ├──────────────────┤
                  │     │ id (PK)          │
                  │     │ retro_id (FK)    │
                  │     │ column_id        │
                  │     │ comment          │
                  │     │ user_id          │
                  │     └──────────────────┘
                  │
                  │ N:1
                  │
                  ▼
       ┌──────────────────┐
       │ retro_templates  │
       ├──────────────────┤
       │ id (PK)          │
       │ title            │
       │ template_columns │
       │ cover_url        │
       └──────────────────┘
```

### Row Level Security (RLS)

All tables use RLS to enforce team-based access:

```sql
-- Example: Retros table policy
CREATE POLICY "Users can view their team's retros"
  ON retros FOR ALL
  USING (
    team_id = (auth.jwt()->>'user_metadata')::json->>'team_id'
  );
```

**Security Model:**

- Users can only access their team's data
- Team ID stored in user metadata
- Policies checked on every query
- No trust in client-side code

## Supabase Integration

### Client Initialization

**Server Client:**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                },
            },
        },
    )
}
```

**Client Client:**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default supabase
```

### Type Safety

TypeScript types generated from database schema:

```typescript
// src/lib/supabase/schema.ts
export type Database = {
    public: {
        Tables: {
            retros: {
                Row: {
                    id: string
                    name: string
                    team_id: string
                    template_id: string
                    created_at: string
                }
                // Insert and Update types...
            }
        }
    }
}
```

## Performance Optimizations

### 1. Server Components Default

Reduces JavaScript bundle by rendering on server.

### 2. Streaming with Suspense

```typescript
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

### 3. Query Caching

TanStack Query caches responses:

```typescript
queryClient.setQueryData(['retros', teamId], newData)
```

### 4. Optimistic Updates

UI updates before server confirms:

```typescript
onMutate: async (newComment) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['comments'])

    // Optimistically update
    queryClient.setQueryData(['comments'], (old) => [...old, newComment])
}
```

### 5. Code Splitting

Automatic route-based code splitting by Next.js.

## Error Handling

### Server-Side Errors

```typescript
export async function getRetroById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('retros')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Failed to fetch retro:', error)
        return { data: null, error }
    }
}
```

### Client-Side Errors

```typescript
const mutation = useMutation({
    mutationFn: createRetro,
    onError: (error) => {
        toast.error('Failed to create retro')
        console.error(error)
    },
})
```

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Security Considerations

1. **Environment Variables**: Never expose secrets to client
2. **RLS Policies**: Database-level authorization
3. **Middleware**: Edge-level route protection
4. **CSRF Protection**: Built into Next.js forms
5. **XSS Protection**: React escapes by default
6. **SQL Injection**: Supabase parameterizes queries

## Testing Strategy

### Unit Tests

- Pure functions
- Utility helpers
- Validators

### Integration Tests

- Server Actions
- API routes
- Database queries

### E2E Tests

- Critical user flows
- Authentication
- Retro creation and management

## Deployment Architecture

```
┌─────────────────┐
│   Vercel Edge   │ ← Next.js deployment
│   - Middleware  │
│   - SSR/RSC     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Cloud │
│   - PostgreSQL  │
│   - Auth        │
│   - Realtime    │
└─────────────────┘
```

**Vercel Features:**

- Automatic deployments
- Edge middleware
- Serverless functions
- Environment variables
- Preview deployments

**Supabase Features:**

- Managed PostgreSQL
- Automatic backups
- Connection pooling
- Real-time subscriptions
- Authentication service

## Next Steps

- [Authentication System](./04-authentication.md)
- [Data Layer Guide](./05-data-layer.md)
- [Components Guide](./06-components.md)
- [Deployment Guide](./07-deployment.md)
