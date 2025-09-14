# Deployment Guide

This document provides instructions for deploying the Kraamweek app to production.

## Deployment Architecture

- **Frontend & API**: Vercel (optimal for Next.js applications)
- **Database**: Supabase (already configured)
- **CI/CD**: GitHub Actions
- **Domain**: Custom domain support (optional)

## Quick Start Deployment

### 1. Vercel Setup

1. **Connect to Vercel**:
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy manually (first time)
   vercel --prod
   ```

2. **Import from GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will detect Next.js automatically

### 2. Environment Variables Configuration

In your Vercel dashboard, add these environment variables:

#### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars-exactly
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

#### Optional Variables
```
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
SECURITY_HEADERS_ENABLED=true
```

### 3. GitHub Actions Setup

#### Required Secrets
Add these secrets in your GitHub repository settings:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

#### Optional Variables
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
SECURITY_HEADERS_ENABLED=true
```

## Automated Deployment

Once configured, the deployment process is fully automated:

1. **Push to main branch** → Triggers deployment
2. **Pull request** → Triggers preview deployment
3. **Tests pass** → Deployment proceeds
4. **Tests fail** → Deployment is blocked

## Deployment Process

The CI/CD pipeline includes:

1. **🧹 Lint & Test** - Code quality checks
2. **🏗️ Build** - Production build generation  
3. **🔒 Security Scan** - Vulnerability assessment
4. **🚀 Deploy** - Automatic deployment to Vercel

## Health Check

Monitor your deployment:
- **Health Endpoint**: `https://your-domain.com/api/health`
- **Status Page**: Built-in monitoring in Vercel dashboard

## Custom Domain (Optional)

### 1. Add Domain to Vercel
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Update Environment Variables
```
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### 3. Update Security Headers
The app automatically configures security headers for production including:
- Strict Transport Security (HTTPS)
- Content Security Policy
- XSS Protection
- Frame Options

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Test build locally
   npm run build
   ```

2. **Environment Variables**:
   - Check Vercel dashboard for missing variables
   - Ensure secrets are properly set in GitHub

3. **Database Connection**:
   - Verify Supabase configuration
   - Check health endpoint: `/api/health`

4. **GitHub Actions Failing**:
   - Check workflow logs in GitHub Actions tab
   - Verify all required secrets are set

### Build Debugging

```bash
# Run full test suite
npm test

# Check for security vulnerabilities
npm audit

# Test production build locally
npm run build && npm start
```

## Performance Optimization

The app is optimized for production with:

- **Static Generation**: Pre-rendered pages
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js built-in optimization
- **CDN**: Vercel's global edge network
- **Caching**: Automatic caching strategies

## Security Features

- **Security Headers**: Comprehensive security headers
- **Rate Limiting**: API protection
- **HTTPS**: Forced HTTPS in production
- **Environment Isolation**: Secure secret management
- **Vulnerability Scanning**: Automated security audits

## Monitoring

### Built-in Monitoring
- **Vercel Analytics**: Performance monitoring
- **Function Logs**: Real-time API logs
- **Health Checks**: Automated health monitoring

### Manual Monitoring
```bash
# Check deployment status
curl https://your-domain.com/api/health

# Monitor logs via Vercel CLI
vercel logs
```

## Rollback Procedure

If issues arise:

1. **Automatic Rollback**: Failed deployments don't affect production
2. **Manual Rollback**: Use Vercel dashboard to promote previous deployment
3. **Hotfix**: Push fix to main branch for immediate deployment

## Support

For deployment issues:
1. Check this documentation
2. Review Vercel documentation
3. Check GitHub Actions logs
4. Contact team for assistance