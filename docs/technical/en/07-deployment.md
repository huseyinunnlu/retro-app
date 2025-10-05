# Deployment Guide

This guide covers deploying the Retro App to production.

## Deployment Overview

The application is designed to be deployed on:

- **Frontend**: Netlify with GitHub Actions
- **Backend**: Supabase Cloud (managed service)
- **Database**: PostgreSQL (via Supabase)
- **CDN**: Netlify Edge or Cloudflare

## Prerequisites

Before deploying, ensure you have:

- A Supabase project set up
- A Netlify account
- Git repository for the code
- Environment variables configured
- GitHub repository connected

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

## Netlify Deployment

### Initial Setup

1. **Install Netlify CLI**:

```bash
bun install -g netlify-cli
```

2. **Login to Netlify**:

```bash
netlify login
```

3. **Create New Site**:

```bash
netlify init
```

### Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Or via CLI:

```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
```

### Build Settings

Configure in `netlify.toml`:

```toml
[build]
  command = "bun run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deploy

**Production Deployment via CLI**:

```bash
netlify deploy --prod
```

**Preview Deployment**:

```bash
netlify deploy
```

### Automatic Deployments with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

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

            - name: Build
              run: bun run build
              env:
                  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

            - name: Deploy to Netlify
              uses: nwtgck/actions-netlify@v2
              with:
                  publish-dir: '.next'
                  production-deploy: true
                  github-token: ${{ secrets.GITHUB_TOKEN }}
                  deploy-message: 'Deploy from GitHub Actions'
              env:
                  NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
                  NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Custom Domain

1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificates are automatic

### Monitoring

Netlify provides:

- **Logs**: Real-time deployment and function logs
- **Analytics**: Page views and performance (Pro plan)
- **Deploy previews**: Automatic preview deployments
- **Split testing**: A/B testing capabilities

## Alternative Deployment Options

### Manual Deployment

If you prefer manual deployments without GitHub Actions:

1. Build locally:

```bash
bun run build
```

2. Deploy using Netlify CLI:

```bash
netlify deploy --prod
```

### Branch Deploys

Netlify automatically creates preview deployments for all branches:

1. Push to any branch
2. Netlify creates a unique preview URL
3. Preview deployments don't affect production
4. Perfect for testing before merging

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

Netlify automatically uses its global CDN. For additional optimization:

1. Enable Netlify Edge Functions (if needed)
2. Configure cache-control headers
3. Use Netlify's built-in asset optimization
4. Consider Cloudflare for additional caching if needed

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] Supabase service role key is kept secret
- [ ] RLS policies are applied to all tables
- [ ] HTTPS is enforced (Netlify provides automatic SSL)
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented (via Supabase or Netlify Edge Functions)
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

Add analytics to track user behavior. Options include:

- **Netlify Analytics**: Built-in server-side analytics (no client-side code required)
- **Google Analytics**: Traditional analytics solution
- **Plausible**: Privacy-focused analytics
- **PostHog**: Open-source product analytics

Enable Netlify Analytics in Site Settings → Analytics.

### Uptime Monitoring

Use services like:

- UptimeRobot
- Pingdom
- Betterstack
- StatusCake

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

Netlify auto-scales:

- Serverless functions scale automatically
- Edge functions run at the edge globally
- Static assets cached at CDN edge nodes
- Automatic load balancing

### Caching Strategy

1. **Browser Cache**: Set cache-control headers
2. **CDN Cache**: Cache static assets
3. **Application Cache**: Use React Query
4. **Database Cache**: Use materialized views for complex queries

## CI/CD Pipeline

### GitHub Actions Configuration

The deployment workflow is already configured in the Netlify Deployment section above.

**Required GitHub Secrets:**

- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: Your site ID from Netlify
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

**To add secrets:**

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## Rollback Strategy

### Netlify Rollback

1. Go to Deploys in Netlify dashboard
2. Find the last working deployment
3. Click "Publish deploy" to rollback to that version
4. Or use CLI: `netlify rollback`

### Database Rollback

1. Use Supabase point-in-time recovery
2. Or restore from manual backup
3. Test in staging first
4. Coordinate application and database rollbacks

## Environment Management

### Development

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-key
```

### Staging/Preview

```bash
# Netlify Deploy Preview
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
```

Configure context-specific environment variables in Netlify:

- Deploy Preview context
- Branch deploys context

### Production

```bash
# Netlify Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

Set in Netlify Dashboard → Site Settings → Environment Variables

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify environment variables in Site Settings
- Test build locally: `bun run build`
- Check TypeScript errors: `bun tsc --noEmit`
- Review Netlify function logs

### Runtime Errors

- Check Netlify function logs in dashboard
- Check browser console for client errors
- Review Sentry errors (if configured)
- Check Supabase logs for database issues
- Use Netlify CLI: `netlify logs`

### Performance Issues

- Use Netlify Analytics (if enabled)
- Check database query performance in Supabase
- Review bundle size with Next.js analyzer
- Analyze loading times with Lighthouse
- Check CDN cache hit rates

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
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify CLI Documentation](https://cli.netlify.com)
