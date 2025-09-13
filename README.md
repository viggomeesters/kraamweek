This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Kraamweek App - Postpartum Care Tracking

A Dutch postpartum care tracking application for monitoring baby and mother health during the "kraamweek" period.

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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
