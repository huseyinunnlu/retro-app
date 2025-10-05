# Data Layer Guide

This guide explains how data is fetched, mutated, and synchronized in the Retro App.

## Overview

The data layer consists of:

- **Supabase Client**: PostgreSQL database access
- **Server Actions**: Server-side data operations
- **TanStack Query**: Client-side caching and mutations
- **Real-time Subscriptions**: Live data synchronization

## Supabase Clients

### Server Client (SSR)

Used in Server Components and Server Actions:

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

**When to use:**

- Server Components
- Server Actions
- Route Handlers
- Middleware

**Benefits:**

- Direct database access
- Automatic session handling
- Server-side security

### Browser Client (CSR)

Used in Client Components:

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default supabase
```

**When to use:**

- Client Components
- Real-time subscriptions
- Client-side mutations
- Browser-only operations

**Benefits:**

- Works in browser
- Automatic token refresh
- Real-time capabilities

## Type Safety

### Schema Types

Generate types from your Supabase schema:

```bash
bun supabase gen types typescript --project-id your-project-ref > src/lib/supabase/schema.ts
```

### Using Types

```typescript
import { Database } from '@/lib/supabase/schema'

type Retro = Database['public']['Tables']['retros']['Row']
type RetroInsert = Database['public']['Tables']['retros']['Insert']
type RetroUpdate = Database['public']['Tables']['retros']['Update']
```

### Type Overrides for Joins

When selecting joined data, override types:

```typescript
const { data } = await supabase
    .from('retros')
    .select('*, retro_template:retro_templates(*)')
    .single()
    .overrideTypes<{
        retro_template: Database['public']['Tables']['retro_templates']['Row'] & {
            template_columns: TemplateColumn[]
        }
    }>()
```

## Server Actions

Server Actions handle all data mutations:

### Retro Actions

```typescript
// src/actions/retro.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRetroById(id: string) {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getSession()

    return await supabase
        .from('retros')
        .select(
            '*, retro_template:retro_templates(*), team:team_id(*), retro_comments:retro_comments(*)',
        )
        .eq('id', id)
        .eq('team_id', user?.session?.user?.user_metadata.team_id)
        .single()
}

export async function getRetrosByTeamId(teamId: string) {
    const supabase = await createClient()

    return await supabase
        .from('retros')
        .select('*, retro_template:retro_templates(id, cover_url, title)')
        .eq('team_id', teamId)
}

export async function deleteRetro(retroId: string) {
    const supabase = await createClient()

    return await supabase.from('retros').delete().eq('id', retroId)
}
```

### Comment Actions

```typescript
// src/actions/retro.ts (continued)
'use server'

export async function createComment(data: {
    retro_id: string
    column_id: string
    comment: string
    user_id: string
}) {
    const supabase = await createClient()

    return await supabase.from('retro_comments').insert(data).select().single()
}

export async function updateComment(id: string, comment: string) {
    const supabase = await createClient()

    return await supabase
        .from('retro_comments')
        .update({ comment })
        .eq('id', id)
}

export async function changeCommentColumn(
    commentId: string,
    newColumnId: string,
) {
    const supabase = await createClient()

    return await supabase
        .from('retro_comments')
        .update({ column_id: newColumnId })
        .eq('id', commentId)
}
```

## Client Queries

TanStack Query manages client-side data fetching and caching:

### Query Definitions

```typescript
// src/queries/retro.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import supabase from '@/lib/supabase/client'

export function useRetros(teamId: string) {
    return useQuery({
        queryKey: ['retros', teamId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('retros')
                .select(
                    '*, retro_template:retro_templates(id, title, cover_url)',
                )
                .eq('team_id', teamId)

            if (error) throw error
            return data
        },
    })
}

export function useRetro(retroId: string) {
    return useQuery({
        queryKey: ['retro', retroId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('retros')
                .select('*, retro_template:retro_templates(*)')
                .eq('id', retroId)
                .single()

            if (error) throw error
            return data
        },
    })
}
```

### Mutation Definitions

```typescript
// src/queries/retro.ts (continued)
export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: {
            retro_id: string
            column_id: string
            comment: string
            user_id: string
        }) => {
            const { data: result, error } = await supabase
                .from('retro_comments')
                .insert(data)
                .select()
                .single()

            if (error) throw error
            return result
        },
        onSuccess: (newComment) => {
            // Invalidate retro query to refetch comments
            queryClient.invalidateQueries({
                queryKey: ['retro', newComment.retro_id],
            })

            toast.success('Comment added')
        },
        onError: (error) => {
            toast.error('Failed to add comment')
            console.error(error)
        },
    })
}

export function useDeleteComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from('retro_comments')
                .delete()
                .eq('id', commentId)

            if (error) throw error
        },
        onMutate: async (commentId) => {
            // Optimistic update: remove comment from cache immediately
            queryClient.setQueriesData({ queryKey: ['retro'] }, (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    retro_comments: old.retro_comments.filter(
                        (c: any) => c.id !== commentId,
                    ),
                }
            })
        },
        onError: (error) => {
            // Revert optimistic update on error
            queryClient.invalidateQueries({ queryKey: ['retro'] })
            toast.error('Failed to delete comment')
        },
    })
}

export function useChangeColumnIdMutation() {
    return useMutation({
        mutationFn: async ({
            commentId,
            newColumnId,
        }: {
            commentId: string
            newColumnId: string
        }) => {
            const { error } = await supabase
                .from('retro_comments')
                .update({ column_id: newColumnId })
                .eq('id', commentId)

            if (error) throw error
        },
    })
}
```

## Real-time Synchronization

### Setting Up Subscriptions

```typescript
// src/contexts/RetroContext.tsx
'use client'

export function RetroContextProvider({ children, retroData }) {
  const [retroComments, setRetroComments] = useState(retroData.retro_comments || [])
  const [lastUpdatedCommentId, setLastUpdatedCommentId] = useState<string | null>(null)

  useEffect(() => {
    if (!retroData.id) return

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'retro_comments',
          filter: `retro_id=eq.${retroData.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRetroComments(prev => [...prev, payload.new as Comment])
          }

          if (payload.eventType === 'UPDATE') {
            // Skip self-updates (optimistic updates)
            if (payload.new?.id === lastUpdatedCommentId) {
              setLastUpdatedCommentId(null)
              return
            }

            setRetroComments(prev =>
              prev.map(comment =>
                comment.id === payload.new?.id
                  ? (payload.new as Comment)
                  : comment
              )
            )
          }

          if (payload.eventType === 'DELETE') {
            setRetroComments(prev =>
              prev.filter(comment => comment.id !== payload.old?.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [retroData.id, retroComments, lastUpdatedCommentId])

  return (
    <RetroContext.Provider value={{ retroData, retroComments }}>
      {children}
    </RetroContext.Provider>
  )
}
```

### Preventing Double Updates

When performing optimistic updates, prevent duplicate updates from real-time:

```typescript
function changeCommentColumn(commentId: string, newColumnId: string) {
    // Mark as self-updated
    setLastUpdatedCommentId(commentId)

    // Optimistic update
    setRetroComments((prev) =>
        prev.map((comment) =>
            comment.id === commentId
                ? { ...comment, column_id: newColumnId }
                : comment,
        ),
    )

    // Mutate on server
    changeColumnIdMutation.mutate({ commentId, newColumnId })
}
```

### Enabling Real-time on Tables

In Supabase SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE retro_comments;
```

### Filtering Subscriptions

Subscribe to specific rows:

```typescript
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'retro_comments',
  filter: `retro_id=eq.${retroId}` // Only this retro's comments
}, handleChange)
```

## Query Caching Strategies

### Cache Keys

Organize cache with hierarchical keys:

```typescript
;['retros'][('retros', teamId)][('retro', retroId)][ // All retros // Team's retros // Specific retro
    ('retro', retroId, 'comments')
] // Retro's comments
```

### Cache Invalidation

```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['retro', retroId] })

// Invalidate all retros
queryClient.invalidateQueries({ queryKey: ['retros'] })

// Invalidate all queries
queryClient.invalidateQueries()
```

### Cache Updates

```typescript
// Update cache directly (optimistic update)
queryClient.setQueryData(['retro', retroId], (old) => ({
    ...old,
    name: 'New Name',
}))

// Update multiple queries
queryClient.setQueriesData({ queryKey: ['retros'] }, (old) => {
    // Update logic
})
```

### Stale Time Configuration

```typescript
export function useRetros(teamId: string) {
    return useQuery({
        queryKey: ['retros', teamId],
        queryFn: fetchRetros,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    })
}
```

## Error Handling

### Server Action Errors

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

### Query Errors

```typescript
export function useRetro(retroId: string) {
    return useQuery({
        queryKey: ['retro', retroId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('retros')
                .select('*')
                .eq('id', retroId)
                .single()

            if (error) throw error
            return data
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
}
```

### Mutation Errors

```typescript
export function useCreateRetro() {
    return useMutation({
        mutationFn: createRetro,
        onError: (error, variables, context) => {
            // Revert optimistic update
            if (context?.previousData) {
                queryClient.setQueryData(['retros'], context.previousData)
            }

            toast.error('Failed to create retro')
            console.error(error)
        },
    })
}
```

## Best Practices

### 1. Use Server Actions for Mutations

```typescript
// ✅ Good: Server Action
'use server'
export async function createRetro(data) {
    const supabase = await createClient()
    return await supabase.from('retros').insert(data)
}

// ❌ Bad: Direct client mutation
export function createRetro(data) {
    return supabase.from('retros').insert(data)
}
```

### 2. Always Handle Errors

```typescript
const { data, error } = await supabase.from('retros').select('*')

if (error) {
    console.error(error)
    throw error // or return error
}
```

### 3. Use Type Safety

```typescript
// ✅ Good: Typed
const { data } = await supabase.from('retros').select('*').returns<Retro[]>()

// ❌ Bad: Untyped
const { data } = await supabase.from('retros').select('*')
```

### 4. Optimize Queries

```typescript
// Select only needed columns
.select('id, name, created_at')

// Use filters
.eq('team_id', teamId)
.order('created_at', { ascending: false })
.limit(10)

// Use single() for one result
.single()
```

### 5. Implement Optimistic Updates

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries(['retros'])

  const previous = queryClient.getQueryData(['retros'])

  queryClient.setQueryData(['retros'], old => [...old, newData])

  return { previous }
},
onError: (err, newData, context) => {
  queryClient.setQueryData(['retros'], context.previous)
}
```

## Performance Tips

1. **Use React Query Devtools** for debugging
2. **Set appropriate stale times** to reduce refetches
3. **Use query prefetching** for expected navigation
4. **Implement pagination** for large datasets
5. **Use select options** to transform data
6. **Batch mutations** when possible
7. **Unsubscribe from real-time** when component unmounts

## Troubleshooting

### Issue: Data not updating in UI

- Check if query key is correct
- Verify cache invalidation after mutations
- Check real-time subscription setup

### Issue: Too many refetches

- Increase `staleTime`
- Disable `refetchOnWindowFocus` if needed
- Check for unnecessary invalidations

### Issue: Real-time not working

- Verify table is added to `supabase_realtime` publication
- Check WebSocket connection in Network tab
- Verify filter syntax is correct

## Next Steps

- [Components Guide](./06-components.md)
- [Deployment Guide](./07-deployment.md)
