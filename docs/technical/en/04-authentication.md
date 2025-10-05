# Authentication System

This guide explains how authentication and authorization work in the Retro App.

## Overview

The authentication system is built on:

- **Supabase Auth**: Handles user authentication
- **Team-based Authorization**: Users belong to teams
- **Invite Token System**: Secure team onboarding
- **Middleware Protection**: Route guards at the edge
- **Row Level Security**: Database-level access control

## Authentication Flow

### Registration Flow

```
User → Register Page → Form Submission → Server Action
                                              ↓
                                    Check Invite Token
                                              ↓
                                    ┌─────────┴─────────┐
                                    ↓                   ↓
                            Valid Token          No Token
                                    ↓                   ↓
                            Join Team           Create Team
                                    ↓                   ↓
                            Create User         Create User
                                    ↓                   ↓
                            Set Metadata        Set Metadata
                                    └─────────┬─────────┘
                                              ↓
                                    Redirect to Dashboard
```

### Login Flow

```
User → Login Page → Form Submission → Server Action
                                            ↓
                                Sign In with Password
                                            ↓
                                    ┌───────┴───────┐
                                    ↓               ↓
                              Success         Failure
                                    ↓               ↓
                          Redirect to /      Show Error
```

## Implementation Details

### 1. Server Actions

#### Registration Action

```typescript
// src/actions/auth.ts
'use server'

export async function register(formData: RegisterFormData, token?: string) {
    const supabase = await createClient()

    let teamId: string

    if (token) {
        // Join existing team
        const { data: team } = await getTeamByInviteToken(token)
        if (!team) throw new Error('Invalid invite token')
        teamId = team.id
    } else {
        // Create new team
        const { data: newTeam } = await supabase
            .from('teams')
            .insert({ name: formData.teamName })
            .select()
            .single()
        teamId = newTeam.id
    }

    // Sign up user
    const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                team_id: teamId,
                full_name: formData.fullName,
            },
        },
    })

    if (error) throw error
}
```

#### Login Action

```typescript
// src/actions/auth.ts
'use server'

export async function login(formData: LoginFormData) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    })

    if (error) throw error
}
```

#### User Data Initialization

```typescript
// src/actions/auth.ts
'use server'

export async function initUserData() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const teamId = user.user_metadata.team_id

    const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

    return { user, team }
}
```

### 2. Client Components

#### Login Form

```typescript
// src/components/Auth/LoginForm/LoginForm.tsx
'use client'

export function LoginForm() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema)
  })

  const loginMutation = useLogin()

  const onSubmit = async (data: LoginFormSchema) => {
    await loginMutation.mutateAsync(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

#### Register Form

```typescript
// src/components/Auth/RegisterForm/RegisterForm.tsx
'use client'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema)
  })

  const registerMutation = useRegister()

  const onSubmit = async (data: RegisterFormSchema) => {
    await registerMutation.mutateAsync({ ...data, token })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Show team name field only if no token */}
      {!token && <TeamNameField />}
      {/* Other fields */}
    </form>
  )
}
```

### 3. Client Queries

```typescript
// src/queries/auth.ts
import { useMutation } from '@tanstack/react-query'
import { login, register } from '@/actions/auth'

export function useLogin() {
    const router = useRouter()

    return useMutation({
        mutationFn: login,
        onSuccess: () => {
            router.push('/')
            router.refresh()
        },
        onError: (error) => {
            toast.error('Login failed')
        },
    })
}

export function useRegister() {
    const router = useRouter()

    return useMutation({
        mutationFn: ({ email, password, fullName, teamName, token }) => {
            return register({ email, password, fullName, teamName }, token)
        },
        onSuccess: () => {
            router.push('/')
            router.refresh()
        },
        onError: (error) => {
            toast.error('Registration failed')
        },
    })
}
```

### 4. Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = publicRoutes.includes(request.nextUrl.pathname)

    // Redirect authenticated users away from auth pages
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Redirect unauthenticated users to login
    if (!user && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|favicon.ico).*)',
    ],
}
```

### 5. Auth Context Provider

```typescript
// src/contexts/AuthContext.tsx
'use client'

export function AuthContextProvider({ children, initialUser, initialTeam }) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [team, setTeam] = useState(initialTeam)

  useEffect(() => {
    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setTeam(null)
          router.push('/login')
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          // Fetch team data
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <AuthContext.Provider value={{ user, team }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Team Management

### Team Structure

```typescript
interface Team {
    id: string
    name: string
    invite_token: string | null
    created_at: string
}
```

### User Metadata

When a user signs up, their team association is stored in metadata:

```typescript
{
  email: 'user@example.com',
  user_metadata: {
    team_id: 'uuid-here',
    full_name: 'John Doe'
  }
}
```

### Invite Token System

#### Generating Invite Tokens

```typescript
// Generate a unique token for team invites
const inviteToken = crypto.randomUUID()

await supabase
    .from('teams')
    .update({ invite_token: inviteToken })
    .eq('id', teamId)
```

#### Using Invite Tokens

**Invite Link Format:**

```
https://app.example.com/register?token=xxx-xxx-xxx&redirectTo=/
```

**Registration Flow with Token:**

1. User clicks invite link
2. Redirected to `/register?token=xxx`
3. Form pre-fills with token (hidden)
4. On submit, validates token
5. If valid, adds user to existing team
6. Redirects to specified path

### Team Switching

Currently, users belong to one team. For multi-team support:

```typescript
// Future implementation
interface UserTeamMembership {
    user_id: string
    team_id: string
    role: 'owner' | 'admin' | 'member'
    created_at: string
}
```

## Authorization

### Row Level Security (RLS)

Database policies enforce team-based access:

#### Teams Table

```sql
-- Users can only view their own team
CREATE POLICY "Users can view their team"
  ON teams FOR SELECT
  USING (id = (auth.jwt()->>'user_metadata')::json->>'team_id');
```

#### Retros Table

```sql
-- Users can only access their team's retros
CREATE POLICY "Users can access their team's retros"
  ON retros FOR ALL
  USING (team_id = (auth.jwt()->>'user_metadata')::json->>'team_id');
```

#### Comments Table

```sql
-- Users can only access comments in their team's retros
CREATE POLICY "Users can access comments in their team's retros"
  ON retro_comments FOR ALL
  USING (
    retro_id IN (
      SELECT id FROM retros
      WHERE team_id = (auth.jwt()->>'user_metadata')::json->>'team_id'
    )
  );
```

### Client-Side Guards

While RLS is the primary security mechanism, we also implement client-side checks for UX:

```typescript
// Only show delete button for comment owner
{comment.user_id === user.id && (
  <DeleteButton commentId={comment.id} />
)}
```

## Session Management

### Session Storage

Supabase stores sessions in cookies:

- `sb-access-token`: Access token
- `sb-refresh-token`: Refresh token

### Session Refresh

Automatic session refresh handled by Supabase client:

```typescript
// Auto-refreshes when token expires
const {
    data: { session },
} = await supabase.auth.getSession()
```

### Logout

```typescript
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}
```

## Security Best Practices

### 1. Never Trust Client Input

Always validate on the server:

```typescript
export async function createRetro(data: unknown) {
    // Validate with Zod schema
    const validated = retroSchema.parse(data)

    // Use server-side client
    const supabase = await createClient()

    // RLS enforces team access
    const { data: retro } = await supabase.from('retros').insert(validated)
}
```

### 2. Use Server Actions for Mutations

Never expose database credentials to the client:

```typescript
// ✅ Good: Server Action
'use server'
export async function deleteRetro(id: string) {
    const supabase = await createClient()
    // RLS ensures user can only delete their team's retros
    await supabase.from('retros').delete().eq('id', id)
}

// ❌ Bad: Client-side with exposed credentials
```

### 3. Validate Invite Tokens

```typescript
export async function getTeamByInviteToken(token: string) {
    const supabase = await createClient()

    return await supabase
        .from('teams')
        .select('*')
        .eq('invite_token', token)
        .single()
}
```

### 4. Sanitize User Input

React automatically escapes strings, but be careful with:

- `dangerouslySetInnerHTML`
- Direct DOM manipulation
- URL parameters

### 5. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...  # Safe to expose
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...      # Never expose!
```

## Testing Authentication

### Unit Tests

```typescript
describe('login action', () => {
    it('should sign in user with valid credentials', async () => {
        const result = await login({
            email: 'test@example.com',
            password: 'password123',
        })

        expect(result.error).toBeNull()
    })

    it('should return error for invalid credentials', async () => {
        const result = await login({
            email: 'test@example.com',
            password: 'wrong',
        })

        expect(result.error).toBeDefined()
    })
})
```

### Integration Tests

```typescript
describe('authentication flow', () => {
  it('should redirect to dashboard after login', async () => {
    // Render login page
    render(<LoginPage />)

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    // Submit
    fireEvent.click(submitButton)

    // Wait for redirect
    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
    })
  })
})
```

## Troubleshooting

### Common Issues

**Issue: "Invalid JWT" errors**

- Cause: Token expired or malformed
- Solution: Clear cookies and re-login

**Issue: User can't access team data**

- Cause: `team_id` not in user metadata
- Solution: Check user metadata after registration

**Issue: RLS policies blocking queries**

- Cause: Policy configuration mismatch
- Solution: Review policies in Supabase dashboard

**Issue: Middleware redirect loop**

- Cause: Matcher includes static files
- Solution: Update matcher to exclude necessary paths

## Next Steps

- [Data Layer Guide](./05-data-layer.md)
- [Components Guide](./06-components.md)
- [Deployment Guide](./07-deployment.md)
