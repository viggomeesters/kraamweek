# Backend API Implementation

This document describes the backend REST API implementation for the Kraamweek app.

## Overview

The backend has been implemented using:
- **Next.js API Routes** for REST endpoints
- **Supabase** for database and backend services
- **TypeScript** for type safety
- **Hybrid DataService** for gradual migration from localStorage to API

## API Endpoints

### Baby Records
- `GET /api/baby-records` - Get all baby health records
- `POST /api/baby-records` - Create new baby health record

### Mother Records
- `GET /api/mother-records` - Get all mother health records
- `POST /api/mother-records` - Create new mother health record

### Baby Profile
- `GET /api/baby-profile` - Get baby profile
- `POST /api/baby-profile` - Create baby profile
- `PUT /api/baby-profile` - Update baby profile
- `DELETE /api/baby-profile` - Delete baby profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update specific task

### Alerts
- `GET /api/alerts` - Get all health alerts
- `POST /api/alerts` - Create new alert

### Family Observations
- `GET /api/family-observations` - Get all family observations
- `POST /api/family-observations` - Create new family observation

### Bulk Data Operations
- `GET /api/data` - Get all application data
- `DELETE /api/data` - Clear all data

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Create the following tables in your Supabase SQL editor:

#### Baby Records Table
```sql
CREATE TABLE baby_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sleep', 'feeding', 'temperature', 'diaper', 'jaundice', 'note', 'pumping', 'weight')),
  value TEXT,
  notes TEXT,
  duration INTEGER,
  amount INTEGER,
  weight INTEGER,
  diaper_type TEXT CHECK (diaper_type IN ('wet', 'dirty', 'both')),
  diaper_amount TEXT CHECK (diaper_amount IN ('little', 'medium', 'much')),
  jaundice_level INTEGER CHECK (jaundice_level BETWEEN 1 AND 5),
  feeding_type TEXT CHECK (feeding_type IN ('bottle', 'breast_left', 'breast_right', 'breast_both')),
  breast_side TEXT CHECK (breast_side IN ('left', 'right', 'both')),
  note_category TEXT CHECK (note_category IN ('general', 'question', 'todo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for baby_records table
ALTER TABLE baby_records ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own baby records
CREATE POLICY "Users can view own baby records" ON baby_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own baby records" ON baby_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own baby records" ON baby_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own baby records" ON baby_records
  FOR DELETE USING (auth.uid() = user_id);
```

#### Mother Records Table
```sql
CREATE TABLE mother_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('temperature', 'blood_pressure', 'mood', 'pain', 'feeding_session', 'note')),
  value TEXT,
  notes TEXT,
  duration INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'low', 'very_low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for mother_records table
ALTER TABLE mother_records ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own mother records
CREATE POLICY "Users can view own mother records" ON mother_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mother records" ON mother_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mother records" ON mother_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mother records" ON mother_records
  FOR DELETE USING (auth.uid() = user_id);
```

#### Baby Profiles Table
```sql
CREATE TABLE baby_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voornaam TEXT NOT NULL,
  achternaam TEXT NOT NULL,
  roepnaam TEXT,
  geslacht TEXT NOT NULL CHECK (geslacht IN ('jongen', 'meisje', 'onbekend')),
  geboortedatum DATE NOT NULL,
  geboortijd TIME,
  geboortgewicht INTEGER,
  geboortelengte INTEGER,
  hoofdomvang INTEGER,
  goede_start_score INTEGER,
  zwangerschapsduur INTEGER,
  moeder_naam TEXT,
  partner_naam TEXT,
  huisarts TEXT,
  verloskundige TEXT,
  ziekenhuis TEXT,
  bijzonderheden TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  naam TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ouders', 'kraamhulp')),
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('household', 'baby_care', 'mother_care', 'administrative', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to TEXT CHECK (assigned_to IN ('parents', 'kraamhulp', 'family', 'other')),
  created_by TEXT NOT NULL CHECK (created_by IN ('parents', 'kraamhulp')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  suggested_by TEXT
);
```

#### Alerts Table
```sql
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'critical', 'info')),
  category TEXT NOT NULL CHECK (category IN ('baby', 'mother', 'general')),
  message TEXT NOT NULL,
  related_record_id UUID,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolution_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Family Observations Table
```sql
CREATE TABLE family_observations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  observer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bonding', 'environment', 'support', 'health', 'general')),
  observation TEXT NOT NULL,
  concerns TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Testing the API

You can test the API endpoints using curl, Postman, or any HTTP client:

#### Example: Create a baby record
```bash
curl -X POST http://localhost:3000/api/baby-records \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "temperature",
    "value": 36.5,
    "notes": "Baby feeling well"
  }'
```

#### Example: Get all baby records
```bash
curl http://localhost:3000/api/baby-records
```

## Migration Strategy

The implementation includes a `HybridDataService` that allows gradual migration:

1. **Phase 1**: API endpoints work alongside localStorage (current state)
2. **Phase 2**: Frontend components updated to use API calls
3. **Phase 3**: Complete migration to database-backed storage

### Using the Hybrid Service

```typescript
import { DataService } from '@/lib/hybridDataService';

// This will use API if configured, otherwise localStorage
const data = await DataService.loadData();
const record = await DataService.addBabyRecord(newRecord);
```

## Current Status

✅ **Completed:**
- REST API endpoints implemented
- Database schema designed
- Hybrid service for gradual migration
- Type-safe database operations
- Error handling and validation

🔄 **In Progress:**
- Frontend integration with API endpoints
- Database setup instructions
- API testing and validation

⏳ **Next Steps:**
- Update frontend components to use API
- Add authentication and authorization
- Implement real-time features
- Add data validation and sanitization
- Performance optimization

## Benefits

1. **Scalability**: Move from localStorage to proper database
2. **Multi-user support**: Share data between users and devices
3. **Data persistence**: Never lose data due to browser issues
4. **Real-time sync**: Future support for real-time updates
5. **Backup and recovery**: Automatic data backup in the cloud
6. **Analytics**: Better insights with proper data storage

## Development Workflow

1. Start the development server: `npm run dev`
2. Set up Supabase project and configure environment variables
3. Test API endpoints manually or with automated tests
4. Update frontend components gradually
5. Monitor logs for any issues

The application will continue to work with localStorage if Supabase is not configured, ensuring backward compatibility during the migration process.