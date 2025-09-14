This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Kraamweek App - Postpartum Care Tracking

A Dutch postpartum care tracking application for monitoring baby and mother health during the "kraamweek" period.

## Architecture Overview

The application follows a modular component-based architecture with clear separation of concerns:

### Component Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with global styles
│   └── globals.css        # Global CSS styles
├── components/            # React components
│   ├── BottomNav.tsx      # Navigation component for switching between sections
│   ├── FormFields.tsx     # Reusable form field components
│   ├── LoggingGallery.tsx # Main data entry interface for health records
│   ├── Overview.tsx       # Timeline view of all records with filtering
│   ├── Profile.tsx        # Baby profile management
│   ├── Analytics.tsx      # Charts and trend analysis
│   └── Toast.tsx          # Toast notifications
├── lib/                   # Utility libraries and services
│   ├── dataService.ts     # localStorage data persistence and business logic
│   ├── dateUtils.ts       # Date/time formatting (enforces 24-hour format)
│   ├── timeFormatValidator.ts # AM/PM detection and validation
│   ├── eventConverters.ts # Convert records to timeline events
│   ├── filterUtils.ts     # Event filtering and categorization
│   └── recordFormatters.ts # Display formatting for records
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core interfaces (BabyRecord, MotherRecord, etc.)
├── config/               # Configuration files
│   └── loggingTypes.ts   # Form field definitions for all record types
└── __tests__/           # Test files
    └── lib/             # Unit tests for utility functions
```

### Key Architectural Principles

- **Type Safety**: Strict TypeScript with no 'any' types
- **24-hour Time Format**: Enforced throughout the application
- **LocalStorage Persistence**: No external database dependencies
- **Component Modularity**: Reusable, focused components
- **Alert System**: Automatic health threshold monitoring
- **Extensible Configuration**: Easy to add new record types

## Logging System

The application provides a comprehensive logging system for tracking baby and mother health data:

### Logging Categories

**Baby Records:**
- 🌡️ Temperature monitoring with alert thresholds
- 🍼 Feeding sessions (bottle, breast, pumping)
- 💤 Sleep duration tracking
- 🎯 Diaper changes (wet/dirty, amount)
- 💛 Jaundice level monitoring (1-5 scale)
- ⚖️ Weight measurements
- 📝 Notes (general, questions, todos)

**Mother Records:**
- 🌡️ Temperature monitoring with fever alerts
- 🩺 Blood pressure tracking with threshold alerts
- 😊 Mood tracking (excellent to very low)
- 😣 Pain level monitoring (1-10 scale)
- 🤱 Feeding session duration
- 📝 General notes

### Using the Logging System

```typescript
// Example: Adding a baby temperature record
import { DataService } from '@/lib/dataService';

const temperatureRecord = {
  timestamp: new Date().toISOString(),
  type: 'temperature' as const,
  value: 36.5,
  notes: 'Normal temperature after feeding'
};

DataService.addBabyRecord(temperatureRecord);
```

### Automatic Alert Generation

The system automatically generates alerts for concerning values:
- **Temperature**: Alerts for < 36.0°C or > 37.5°C (baby), > 38.0°C (mother)
- **Jaundice**: Alerts for levels 4-5
- **Blood Pressure**: Alerts for abnormal readings
- **Pain**: Alerts for levels 8-10
- **Feeding Gaps**: Alerts for > 4 hours between feeds

### Task Creation from Notes

Parent questions and todo notes automatically create tasks for kraamhulp:
- **Questions** → Medium priority tasks assigned to kraamhulp
- **Todos** → Low priority household tasks assigned to kraamhulp

## Time Format Requirements

**⚠️ IMPORTANT: This application enforces 24-hour time notation (HH:MM) throughout the entire interface.**

- All time displays use 24-hour format (e.g., "14:30" instead of "2:30 PM")
- Time input fields are configured to accept only 24-hour format
- No AM/PM indicators should appear anywhere in the UI
- All timestamps in data storage use ISO format with 24-hour time
- Date/time utilities in `src/lib/dateUtils.ts` ensure consistent 24-hour formatting

### Validation

To check for AM/PM violations in the UI during development:

```javascript
// Run in browser console
import { testAmPmInUI } from '@/lib/amPmDetector';
testAmPmInUI();
```

### Time Utilities

```typescript
import { formatTime24, formatDateTime24, formatDateDDMMYYYY } from '@/lib/dateUtils';

// Format time in 24-hour format
formatTime24(new Date()) // → "14:30"

// Format full datetime
formatDateTime24(new Date()) // → "15-12-2024 14:30"

// Format date only
formatDateDDMMYYYY(new Date()) // → "15-12-2024"
```

## Testing

The application includes a comprehensive test suite covering all utility functions:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **Date/Time Utilities**: Formatting, locale consistency, 24-hour validation
- **Time Format Validation**: AM/PM detection, format cleaning
- **Data Service**: CRUD operations, alert generation, task creation
- **Error Handling**: localStorage failures, invalid data, edge cases

### Adding Tests

Tests are located in `src/__tests__/` and follow Jest conventions:

```typescript
// Example test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should behave correctly', () => {
    // Test logic
  });
});
```

## Extensibility Guidelines

The application is designed for easy extension and modification:

### Adding New Record Types

1. **Update TypeScript types** in `src/types/index.ts`:
```typescript
export interface BabyRecord {
  // Add new type to union
  type: 'sleep' | 'feeding' | 'new_type';
  // Add type-specific fields
  newField?: string;
}
```

2. **Configure logging form** in `src/config/loggingTypes.ts`:
```typescript
{
  id: 'new_type',
  label: 'New Type',
  icon: '🆕',
  category: 'baby',
  fields: [
    {
      id: 'newField',
      type: 'text',
      label: 'New Field',
      required: true
    }
  ]
}
```

3. **Add alert logic** in `src/lib/dataService.ts` (if needed):
```typescript
private static checkForAlerts(record: BabyRecord, data: AppData): void {
  if (record.type === 'new_type' && record.newField === 'concerning_value') {
    this.addAlert({
      // Alert configuration
    });
  }
}
```

### Supporting Multiple Babies

The current architecture supports this extension:

1. **Update data structure**:
```typescript
export interface AppData {
  babies: BabyProfile[];          // Multiple babies
  babyRecords: Record<string, BabyRecord[]>; // Records per baby ID
  // ... other fields
}
```

2. **Add baby selection UI**
3. **Update DataService methods** to include baby ID parameter

### Adding Notification System

Architecture ready for notifications:

1. **Add notification types**:
```typescript
export interface Notification {
  id: string;
  type: 'alert' | 'reminder' | 'task';
  message: string;
  scheduledFor: string;
  delivered: boolean;
}
```

2. **Implement notification service**:
```typescript
export class NotificationService {
  static scheduleNotification(notification: Omit<Notification, 'id'>): void {
    // Implementation
  }
}
```

### Architecture Considerations

- **State Management**: Consider adding Redux/Zustand for complex state
- **Data Sync**: Architecture supports future cloud synchronization
- **Offline Support**: Built-in with localStorage, ready for service workers
- **Multi-user**: Type system supports role-based features (parents/kraamhulp)
- **Internationalization**: Centralized strings ready for i18n
- **Accessibility**: Component structure supports ARIA improvements

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The Kraamweek app is optimized for deployment on Vercel with automated CI/CD pipeline.

### Quick Deployment

1. **Fork or import** this repository to Vercel
2. **Configure environment variables** (see [DEPLOYMENT.md](./DEPLOYMENT.md))
3. **Deploy automatically** on every push to main branch

### Deployment Features

- ✅ **Automated CI/CD** with GitHub Actions
- ✅ **Production-ready build** with Next.js optimizations
- ✅ **Security headers** and HTTPS enforcement
- ✅ **Health monitoring** endpoint (`/api/health`)
- ✅ **Environment variable** management
- ✅ **Zero-downtime deployments**

### Quick Setup

```bash
# Validate your deployment setup
./scripts/validate-deployment.sh

# Manual deployment (requires Vercel CLI)
npm install -g vercel
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Production Environment

The app gracefully handles different environments:
- **Development**: Uses localStorage with demo data
- **Production**: Integrates with Supabase backend
- **Demo mode**: Works without database connection

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
