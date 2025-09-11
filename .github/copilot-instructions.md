# Kraamweek App - Postpartum Care Tracking Application

Kraamweek App is a Next.js 15.5.3 TypeScript web application for tracking baby and mother health data during the Dutch postpartum care period ("kraamweek"). The app supports two user roles: parents (ouders) who record baby data, and maternity care assistants (kraamhulp) who monitor and manage care tasks. Data is persisted locally in browser localStorage with no external database.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Dependencies
- Install dependencies: `npm install` -- takes ~30 seconds. Installs 341 packages with 0 vulnerabilities.
- Always run this first in a fresh repository clone.

### Development Server
- Start development server: `npm run dev`
- Server starts on http://localhost:3000 (local) and http://10.1.0.93:3000 (network)
- Uses Next.js with Turbopack for fast hot reloading
- **NEVER CANCEL: Server typically starts in ~1-2 seconds but may take up to 60 seconds on slow systems**

### Building
- Build for production: `npm run build` -- takes ~22 seconds. NEVER CANCEL. Set timeout to 60+ minutes for safety.
- Build uses Turbopack for optimized production bundle
- Build output shows bundle sizes and static/server-side rendered routes
- Build creates optimized static pages (5 routes total including /_not-found)

### Production Server
- **WARNING: `npm run start` currently fails with "routesManifest.dataRoutes is not iterable" error**
- This is a known issue with Next.js 15.5.3 + Turbopack combination
- Use development server (`npm run dev`) for all testing and validation
- **DO NOT USE `npm run start` for testing or validation**

### Linting
- Run linting: `npm run lint` -- takes ~2-3 seconds
- Uses ESLint with Next.js and TypeScript rules
- Currently shows 1 warning about unused parameter in dataService.ts (line 225)
- **Always run linting before committing changes**

## Validation Scenarios

### Essential User Flow Testing
After making changes, **ALWAYS** test these complete user scenarios:

1. **Parent User Flow:**
   - Navigate to http://localhost:3000
   - Select "Ouder(s)" role
   - Enter name (e.g., "Test Ouder")
   - Click "Doorgaan"
   - Test baby data entry (temperature, feeding, sleep, diaper, jaundice, notes)
   - Verify data appears in "Recente registraties" section
   - Test logout functionality

2. **Kraamhulp User Flow:**
   - From user selector, select "Kraamhulp" role
   - Enter name (e.g., "Test Kraamhulp")  
   - Click "Doorgaan"
   - Verify dashboard shows baby overview with statistics
   - Test navigation between tabs: 👶 Baby Overzicht, 👩 Moeder, 📋 Observaties, ✅ Taken
   - Verify previously entered data is visible
   - Test logout functionality

3. **Data Persistence Testing:**
   - Add baby temperature record as parent
   - Logout and login as kraamhulp
   - Verify temperature shows in "Laatste temperatuur" stat
   - Verify record appears in "Recente registraties"

### Manual Testing Requirements
- **CRITICAL**: Always test actual user workflows, not just server startup
- Use browser to navigate through complete scenarios listed above
- Verify localStorage persistence by switching between roles
- Test form submissions and data display
- **Take screenshots of UI changes for documentation**

## Repository Structure

### Key Directories
```
/src/app/           # Next.js App Router pages (page.tsx, layout.tsx, globals.css)
/src/components/    # React components (UserSelector, DashboardLayout, ParentDashboard, NurseDashboard)  
/src/lib/           # Utility services (DataService for localStorage operations)
/src/types/         # TypeScript type definitions (BabyRecord, MotherRecord, User, etc.)
/public/            # Static assets (SVG icons: file.svg, globe.svg, next.svg, etc.)
```

### Important Files
- `package.json` - Dependencies and scripts (React 19.1.0, Next.js 15.5.3, TypeScript, TailwindCSS 4)
- `eslint.config.mjs` - ESLint configuration with Next.js rules  
- `tsconfig.json` - TypeScript configuration with path aliases (@/*)
- `next.config.ts` - Next.js configuration (minimal)
- `src/types/index.ts` - Core type definitions for health records and user roles
- `src/lib/dataService.ts` - LocalStorage data persistence with alert generation logic

### Application Architecture
- **No database**: All data stored in browser localStorage
- **Two user roles**: 'parents' and 'kraamhulp' with different dashboard views
- **Real-time alerts**: Automatic generation for temperature, blood pressure, and feeding patterns
- **Dutch language**: All UI text is in Dutch (Netherlands)

## Common Development Tasks

### Adding New Features
1. Always run `npm install` and `npm run dev` first
2. Understand the DataService pattern for data persistence
3. Follow existing component patterns in /src/components/
4. Use existing TypeScript types from /src/types/index.ts
5. Test with both user roles (parents and kraamhulp)
6. Always run `npm run lint` before committing

### Debugging Issues
- Check browser console for errors (particularly localStorage issues)
- Verify TypeScript compilation with build process
- Use development server (not production) for all testing
- Check DataService methods for data flow issues

### Code Style
- Use existing TypeScript patterns
- Follow component structure from existing files
- Use TailwindCSS classes for styling
- Maintain Dutch language consistency in UI text

## Build Pipeline
- **No GitHub Actions**: Repository does not currently have CI/CD workflows
- **No testing framework**: No test scripts defined in package.json
- Manual testing through browser workflows is required
- Linting is the only automated code quality check

## Command Reference

### Timing Expectations
| Command | Time | Timeout | Notes |
|---------|------|---------|-------|
| `npm install` | ~30s | 60s | 341 packages, 0 vulnerabilities |
| `npm run dev` | ~1-2s | 60s | Turbopack hot reload |
| `npm run build` | ~22s | 3600s | NEVER CANCEL - Production build |
| `npm run lint` | ~2-3s | 30s | ESLint with 1 known warning |
| `npm run start` | N/A | N/A | **DO NOT USE - Known to fail** |

### Required Commands for Changes
```bash
# Fresh setup
npm install
npm run dev  # Start development server

# Before committing any changes  
npm run lint
npm run build  # Verify production build works

# Manual testing (browser)
# Navigate to http://localhost:3000
# Test both parent and kraamhulp user flows
```

## Frequently Referenced Information

### Available npm scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack", 
  "start": "next start",  // WARNING: Currently broken
  "lint": "eslint"
}
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0", 
    "next": "15.5.3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "@eslint/eslintrc": "^3"
  }
}
```

### Repository root files
```
.git/               # Git repository
.gitignore          # Standard Next.js gitignore
.next/              # Next.js build output (after build)
README.md           # Basic Next.js setup instructions
eslint.config.mjs   # ESLint configuration
next-env.d.ts       # Next.js TypeScript definitions
next.config.ts      # Next.js configuration
node_modules/       # Dependencies (after npm install)
package-lock.json   # Dependency lock file
package.json        # Project configuration
postcss.config.mjs  # PostCSS configuration
public/             # Static assets
src/                # Application source code
tsconfig.json       # TypeScript configuration
```