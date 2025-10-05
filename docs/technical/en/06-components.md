# Components Guide

This guide covers the component architecture, patterns, and best practices used in the Retro App.

## Component Organization

```
src/components/
├── Auth/                    # Authentication components
│   ├── LoginForm/
│   └── RegisterForm/
├── Layouts/                 # Layout components
│   ├── Main/               # Main app layout
│   └── Providers*.tsx      # Context providers
├── Retro/                   # Retro-specific components
│   ├── CommentForm.tsx
│   ├── CommentsList.tsx
│   ├── RetroColumn.tsx
│   └── RetroPage.tsx
├── RetroCreate/             # Retro creation flow
│   ├── CreateNewRetro.tsx
│   └── CreateNewRetroForm.tsx
├── Shared/                  # Reusable components
│   ├── Form/
│   └── Spinner.tsx
└── ui/                      # shadcn/ui primitives
    ├── button.tsx
    ├── dialog.tsx
    └── ...
```

## Component Patterns

### Server Components

Default for all components unless client-side features are needed:

```typescript
// src/app/(main)/(dashboard)/page.tsx
import { initUserData } from '@/actions/auth'
import { getRetrosByTeamId } from '@/actions/retro'
import { RetroBoardsList } from '@/components/Retro/RetroBoardsList'

export default async function DashboardPage() {
  const { team } = await initUserData()
  const { data: retros } = await getRetrosByTeamId(team.id)

  return (
    <div>
      <h1>Dashboard</h1>
      <RetroBoardsList retros={retros} />
    </div>
  )
}
```

**Benefits:**

- No JavaScript sent to client
- Direct data fetching
- Better SEO
- Faster initial load

### Client Components

Used when interactivity is required:

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function CommentForm({ retroId, columnId }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form content */}
    </form>
  )
}
```

**Indicators for Client Components:**

- Uses `useState`, `useEffect`, or other hooks
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `localStorage`, etc.)
- Third-party libraries requiring client-side execution

## Key Components

### Auth Components

#### LoginForm

```typescript
// src/components/Auth/LoginForm/LoginForm.tsx
'use client'

export function LoginForm() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const loginMutation = useLogin()

  const onSubmit = async (data: LoginFormSchema) => {
    await loginMutation.mutateAsync(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextInputField
          control={form.control}
          name="email"
          label="Email"
          type="email"
        />
        <TextInputField
          control={form.control}
          name="password"
          label="Password"
          type="password"
        />
        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  )
}
```

**Features:**

- React Hook Form integration
- Zod validation
- Loading states
- Error handling

#### RegisterForm

Similar to LoginForm but includes team name field and invite token handling:

```typescript
'use client'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema)
  })

  const registerMutation = useRegister()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {!token && (
        <TextInputField
          control={form.control}
          name="teamName"
          label="Team Name"
        />
      )}
      {/* Other fields */}
    </form>
  )
}
```

### Retro Components

#### RetroPage

Main retro page component:

```typescript
// src/components/Retro/RetroPage.tsx
'use client'

export function RetroPage() {
  const { retroData, retroComments } = useRetroContext()
  const columns = retroData.retro_template.template_columns

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <RetroColumn
            key={column.id}
            column={column}
            comments={retroComments.filter(
              (c) => c.column_id === column.id
            )}
          />
        ))}
      </div>
    </DndProvider>
  )
}
```

**Features:**

- Drag-and-drop context
- Dynamic columns from template
- Filtered comments per column

#### RetroColumn

Individual column component:

```typescript
// src/components/Retro/RetroColumn.tsx
'use client'

export function RetroColumn({ column, comments }) {
  const [, drop] = useDrop({
    accept: DndItemTypes.RETRO_COMMENT_CARD,
    drop: (item: { id: string }) => {
      changeCommentColumn(item.id, column.id)
    }
  })

  return (
    <div ref={drop} className="retro-column">
      <h2>{column.title}</h2>
      <p>{column.description}</p>
      <CommentsList comments={comments} />
      <CommentForm columnId={column.id} />
    </div>
  )
}
```

**Features:**

- Drop target for comments
- Column-specific styling
- Embedded comment form

#### CommentsList

Displays and manages comments:

```typescript
// src/components/Retro/CommentsList.tsx
'use client'

export function CommentsList({ comments }) {
  const { user } = useAuthContext()

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          isOwner={comment.user_id === user.id}
        />
      ))}
    </div>
  )
}

function CommentCard({ comment, isOwner }) {
  const [, drag] = useDrag({
    type: DndItemTypes.RETRO_COMMENT_CARD,
    item: { id: comment.id }
  })

  return (
    <div ref={drag} className="comment-card">
      <p>{comment.comment}</p>
      {isOwner && (
        <div className="actions">
          <EditButton commentId={comment.id} />
          <DeleteButton commentId={comment.id} />
        </div>
      )}
    </div>
  )
}
```

**Features:**

- Drag source for comments
- Owner-only actions
- Real-time updates

#### CommentForm

Add new comments:

```typescript
// src/components/Retro/CommentForm.tsx
'use client'

export function CommentForm({ columnId }) {
  const { retroData } = useRetroContext()
  const { user } = useAuthContext()
  const [comment, setComment] = useState('')
  const createCommentMutation = useCreateComment()

  const handleSubmit = async (e) => {
    e.preventDefault()

    await createCommentMutation.mutateAsync({
      retro_id: retroData.id,
      column_id: columnId,
      comment,
      user_id: user.id
    })

    setComment('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
      />
      <Button type="submit" disabled={!comment || createCommentMutation.isPending}>
        Add Comment
      </Button>
    </form>
  )
}
```

**Features:**

- Simple controlled form
- Mutation integration
- Loading states

### RetroCreate Components

#### CreateNewRetro

Dialog trigger and manager:

```typescript
// src/components/RetroCreate/CreateNewRetro.tsx
'use client'

export function CreateNewRetro() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Retro</Button>
      </DialogTrigger>
      <DialogContent>
        <CreateNewRetroForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
```

#### CreateNewRetroForm

Multi-step form for retro creation:

```typescript
// src/components/RetroCreate/CreateNewRetroForm.tsx
'use client'

export function CreateNewRetroForm({ onSuccess }) {
  const { currentStep, next, back, isFirstStep, isLastStep } = useMultiStepForm([
    <SelectRetroTemplateStep key="template" />,
    <EnterNewRetroDetailsStep key="details" />
  ])

  return (
    <div>
      {currentStep}
      <div className="flex justify-between">
        {!isFirstStep && <Button onClick={back}>Back</Button>}
        {!isLastStep && <Button onClick={next}>Next</Button>}
        {isLastStep && <Button onClick={handleSubmit}>Create</Button>}
      </div>
    </div>
  )
}
```

**Features:**

- Multi-step wizard
- Template selection
- Form validation

### Layout Components

#### Main Layout

```typescript
// src/components/Layouts/Main/Sidebar.tsx
'use client'

export function Sidebar() {
  const { team, user } = useAuthContext()

  return (
    <aside>
      <TeamSwitcher team={team} />
      <NavMain />
      <NavProjects />
      <NavUser user={user} />
    </aside>
  )
}
```

#### Provider Layouts

```typescript
// src/components/Layouts/ProvidersRootLayout.tsx
'use client'

export function ProvidersRootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {children}
    </QueryClientProvider>
  )
}

// src/components/Layouts/ProvidersMainLayout.tsx
'use client'

export function ProvidersMainLayout({ children, user, team }) {
  return (
    <AuthContextProvider initialUser={user} initialTeam={team}>
      {children}
    </AuthContextProvider>
  )
}
```

### Shared Components

#### Form Fields

```typescript
// src/components/Shared/Form/TextInputField.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function TextInputField({ control, name, label, ...props }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

#### Loading Spinners

```typescript
// src/components/Shared/Spinner.tsx
export function Spinner({ size = 'md' }) {
  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]}`} />
  )
}
```

## Styling Conventions

### TailwindCSS

All styling uses Tailwind utility classes:

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold">Title</h2>
  <Button className="ml-auto">Action</Button>
</div>
```

### Class Organization

Order classes by category:

1. Layout (flex, grid, block)
2. Positioning (absolute, relative)
3. Display (hidden, visible)
4. Spacing (p-, m-)
5. Sizing (w-, h-)
6. Typography (text-, font-)
7. Colors (bg-, text-, border-)
8. Effects (shadow, opacity)
9. Transitions (transition-, animate-)

### Responsive Design

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive columns */}
</div>
```

### Dark Mode Support

Using `next-themes`:

```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Auto switches based on theme */}
</div>
```

## Component Best Practices

### 1. Props Interface

Always define props interface:

```typescript
interface ComponentProps {
    title: string
    onAction: () => void
    isLoading?: boolean
}

export function Component({
    title,
    onAction,
    isLoading = false,
}: ComponentProps) {
    // Component logic
}
```

### 2. Destructure Props

```typescript
// ✅ Good
export function Component({ title, onAction }: Props) { }

// ❌ Bad
export function Component(props: Props) {
  return <div>{props.title}</div>
}
```

### 3. Early Returns

```typescript
export function Component({ data }: Props) {
  if (!data) return <EmptyState />
  if (isLoading) return <Spinner />

  return <Content data={data} />
}
```

### 4. Extract Complex Logic

```typescript
export function Component({ items }: Props) {
  const filteredItems = useFilteredItems(items)
  const sortedItems = useSortedItems(filteredItems)

  return <List items={sortedItems} />
}

function useFilteredItems(items: Item[]) {
  return useMemo(() => {
    return items.filter(/* ... */)
  }, [items])
}
```

### 5. Memoization

Use `memo`, `useMemo`, and `useCallback` for performance:

```typescript
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return expensiveOperation(data)
  }, [data])

  const handleClick = useCallback(() => {
    // Handle click
  }, [])

  return <div onClick={handleClick}>{processedData}</div>
})
```

### 6. Compound Components

For complex components:

```typescript
export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

Card.Header = function CardHeader({ children }) {
  return <div className="card-header">{children}</div>
}

Card.Body = function CardBody({ children }) {
  return <div className="card-body">{children}</div>
}

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

## Testing Components

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('should submit comment', async () => {
    const onSubmit = jest.fn()
    render(<CommentForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Add a comment...')
    fireEvent.change(input, { target: { value: 'Test comment' } })

    const button = screen.getByText('Add Comment')
    fireEvent.click(button)

    expect(onSubmit).toHaveBeenCalledWith('Test comment')
  })
})
```

### Integration Tests

```typescript
describe('Retro Page', () => {
  it('should display comments and allow adding new ones', async () => {
    render(<RetroPage retroId="123" />)

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('Existing comment')).toBeInTheDocument()
    })

    // Add new comment
    const input = screen.getByPlaceholderText('Add a comment...')
    fireEvent.change(input, { target: { value: 'New comment' } })
    fireEvent.click(screen.getByText('Add Comment'))

    // Verify new comment appears
    await waitFor(() => {
      expect(screen.getByText('New comment')).toBeInTheDocument()
    })
  })
})
```

## Performance Optimization

1. **Code Splitting**: Use dynamic imports for large components
2. **Lazy Loading**: Load components on demand
3. **Memoization**: Prevent unnecessary re-renders
4. **Virtual Lists**: For long lists (react-window)
5. **Image Optimization**: Use Next.js Image component

## Accessibility

1. **Semantic HTML**: Use appropriate elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: Support tab and enter keys
4. **Focus Management**: Handle focus appropriately
5. **Color Contrast**: Ensure readable text

## Next Steps

- [Deployment Guide](./07-deployment.md)
- [User Documentation](../user/en/01-getting-started.md)
