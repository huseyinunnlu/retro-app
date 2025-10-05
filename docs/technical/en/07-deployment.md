# Deployment Guide

This guide covers deploying the Retro App to production.

## Deployment Overview

The application is designed to be deployed on:

- **Frontend**: Vercel (recommended) or any Node.js hosting
- **Backend**: Supabase Cloud (managed service)
- **Database**: PostgreSQL (via Supabase)
- **CDN**: Vercel Edge Network or Cloudflare

## Prerequisites

Before deploying, ensure you have:

- A Supabase project set up
- A Vercel account (or alternative hosting)
- Git repository for the code
- Environment variables configured

## Supabase Setup

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a strong database password
4. Select a region close to your users
5. Wait for provisioning (2-3 minutes)

### 2. Configure Database

Run the database migration scripts from the [Getting Started Guide](./02-getting-started.md#set-up-database-tables).

### 3. Enable Row Level Security

Ensure all tables have RLS enabled:

```sql
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_templates ENABLE ROW LEVEL SECURITY;
```

### 4. Create RLS Policies

Apply the policies from the Getting Started Guide.

### 5. Enable Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE retro_comments;
```

### 6. Get API Credentials

From Project Settings → API:

- Project URL
- Anon (public) key
- Service role key (keep secret!)

### 7. Configure Authentication

In Authentication settings:

- Enable email provider
- Configure email templates (optional)
- Set site URL to your production domain
- Add redirect URLs

## Vercel Deployment

### Initial Setup

1. **Install Vercel CLI**:

```bash
bun install -g vercel
```

2. **Login to Vercel**:

```bash
vercel login
```

3. **Link Project**:

```bash
vercel link
```

### Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Or via CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### Build Settings

Vercel auto-detects Next.js. Default settings:

- **Framework Preset**: Next.js
- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`
- **Development Command**: `bun run dev`

### Deploy

**Production Deployment**:

```bash
vercel --prod
```

**Preview Deployment**:

```bash
vercel
```

### Automatic Deployments

Connect your Git repository:

1. Go to Vercel Dashboard
2. Import your Git repository
3. Configure settings
4. Every push to `main` triggers production deployment
5. Every push to other branches creates preview deployments

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificates are automatic

### Monitoring

Vercel provides:

- **Logs**: Real-time function logs
- **Analytics**: Page views and performance
- **Speed Insights**: Web Vitals monitoring
- **Error Tracking**: Runtime errors

## Alternative Hosting

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["bun", "server.js"]
```

Update `next.config.ts`:

```typescript
export default {
    output: 'standalone',
}
```

Build and run:

```bash
docker build -t retro-app .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=xxx -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx retro-app
```

### Node.js Hosting (Railway, Render, etc.)

1. Ensure `package.json` has start script:

```json
{
    "scripts": {
        "start": "next start"
    }
}
```

2. Set environment variables in hosting dashboard

3. Configure build command: `bun run build`

4. Configure start command: `bun run start`

## Performance Optimization

### 1. Enable Edge Caching

For static pages:

```typescript
// app/page.tsx
export const revalidate = 3600 // Revalidate every hour
```

### 2. Optimize Images

Use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/image.png"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

### 3. Enable Compression

Next.js automatically compresses responses. For custom server:

```typescript
import compression from 'compression'
app.use(compression())
```

### 4. Database Optimization

**Connection Pooling**:
Supabase includes connection pooling (PgBouncer).

**Indexes**:

```sql
CREATE INDEX idx_retros_team_id ON retros(team_id);
CREATE INDEX idx_comments_retro_id ON retro_comments(retro_id);
```

**Query Optimization**:

- Select only needed columns
- Use appropriate filters
- Limit result sets
- Use pagination

### 5. CDN Configuration

Vercel automatically uses Edge Network. For custom CDN:

1. Set up Cloudflare
2. Configure caching rules
3. Enable compression
4. Use cache-control headers

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] Supabase service role key is kept secret
- [ ] RLS policies are applied to all tables
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented (via Supabase or Vercel)
- [ ] SQL injection protection (Supabase handles this)
- [ ] XSS protection (React handles this)
- [ ] CSRF protection (Next.js handles this)
- [ ] Authentication is required for protected routes
- [ ] User input is validated on both client and server

## Monitoring & Observability

### Error Tracking

Integrate Sentry:

```bash
bun add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
})
```

### Logging

For server-side logging:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
})
```

### Analytics

Add analytics to track user behavior:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Uptime Monitoring

Use services like:

- Vercel uptime monitoring
- UptimeRobot
- Pingdom
- Betterstack

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database:

- Daily automatic backups
- Point-in-time recovery (Pro plan)
- Manual backups via Dashboard

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Using pg_dump
pg_dump -h db.project-ref.supabase.co -U postgres -d postgres > backup.sql
```

### Restore from Backup

```bash
# Using Supabase CLI
supabase db reset

# Using psql
psql -h db.project-ref.supabase.co -U postgres -d postgres < backup.sql
```

## Scaling Considerations

### Database Scaling

Supabase auto-scales compute:

- Vertical scaling: Upgrade to larger instance
- Read replicas: For read-heavy workloads
- Connection pooling: Included by default

### Application Scaling

Vercel auto-scales:

- Serverless functions scale automatically
- Edge middleware runs globally
- Static assets cached at edge

### Caching Strategy

1. **Browser Cache**: Set cache-control headers
2. **CDN Cache**: Cache static assets
3. **Application Cache**: Use React Query
4. **Database Cache**: Use materialized views for complex queries

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v3

            - uses: oven-sh/setup-bun@v1
              with:
                  bun-version: latest

            - name: Install dependencies
              run: bun install --frozen-lockfile

            - name: Run tests
              run: bun test

            - name: Build
              run: bun run build
              env:
                  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

            - name: Deploy to Vercel
              uses: amondnet/vercel-action@v20
              with:
                  vercel-token: ${{ secrets.VERCEL_TOKEN }}
                  vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
                  vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
                  vercel-args: '--prod'
```

## Rollback Strategy

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback

1. Use Supabase point-in-time recovery
2. Or restore from manual backup
3. Test in staging first

## Environment Management

### Development

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-key
```

### Staging

```bash
# Vercel Preview
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
```

### Production

```bash
# Vercel Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

## Troubleshooting

### Build Fails

- Check build logs in Vercel
- Verify environment variables
- Test build locally: `bun run build`
- Check TypeScript errors: `bun tsc --noEmit`

### Runtime Errors

- Check Vercel function logs
- Check browser console
- Review Sentry errors
- Check Supabase logs

### Performance Issues

- Use Vercel Speed Insights
- Check database query performance
- Review bundle size
- Analyze loading times

### Database Connection Issues

- Verify Supabase URL and key
- Check connection pool settings
- Review RLS policies
- Check database logs

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test authentication flow
- [ ] Test creating retros
- [ ] Test adding comments
- [ ] Test real-time updates
- [ ] Verify all environment variables
- [ ] Check error tracking is working
- [ ] Confirm analytics are collecting data
- [ ] Test on multiple devices/browsers
- [ ] Review performance metrics
- [ ] Set up monitoring alerts
- [ ] Document deployment process

## Conclusion

Your Retro App is now deployed and ready for production use. Regular monitoring and maintenance will ensure optimal performance and reliability.

For support and questions, refer to:

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
