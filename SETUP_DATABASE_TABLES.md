# Setup Database Tables for Mentor-Parent-Student Linking

## Quick Setup

To enable the mentor and parent dashboards, you need to create the required database tables.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database/46_mentor_student_sessions.sql`
5. Click "Run"
6. Repeat for `database/45_parent_student_mentor_linking.sql` if not already created

### Option 2: Using Supabase CLI

```bash
# Make sure you're logged in to Supabase
supabase db push

# Or run specific migration
supabase db execute --file database/46_mentor_student_sessions.sql
```

### Option 3: Manual SQL Execution

Copy and run these SQL commands in your Supabase SQL editor:

```sql
-- Mentor-Student Links Table
CREATE TABLE IF NOT EXISTS mentor_student_links (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_student_student ON mentor_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_mentor ON mentor_student_links(mentor_id);

-- Mentoring Sessions Table
CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INT DEFAULT 60,
  notes TEXT,
  rating INT DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_student ON mentoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentor ON mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_date ON mentoring_sessions(session_date DESC);

-- Enable RLS
ALTER TABLE mentor_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_student_links
CREATE POLICY IF NOT EXISTS "Admins can manage mentor-student links" ON mentor_student_links
  FOR ALL USING (true);

-- RLS Policies for mentoring_sessions
CREATE POLICY IF NOT EXISTS "Mentors can view their sessions" ON mentoring_sessions
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "Mentors can create sessions" ON mentoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY IF NOT EXISTS "Mentors can update their sessions" ON mentoring_sessions
  FOR UPDATE USING (auth.uid() = mentor_id);
```

## Verify Tables Were Created

After running the SQL, verify the tables exist:

1. Go to Supabase Dashboard
2. Click "Table Editor" in the left sidebar
3. You should see:
   - `mentor_student_links`
   - `mentoring_sessions`
   - `parent_student_links` (should already exist)
   - `parent_mentor_links` (should already exist)

## Test the Setup

1. Make sure backend is running: `node backend/server.js`
2. Navigate to `/link-account` as admin
3. You should see the "Link Accounts" page without errors
4. The tables should show "No links found" (which is correct if no data exists yet)

## Add Test Data (Optional)

To test the linking functionality, you can add test data:

```sql
-- First, get some user IDs from your profiles table
SELECT id, full_name, role FROM profiles LIMIT 10;

-- Then create test links (replace UUIDs with actual IDs)
INSERT INTO parent_student_links (parent_id, student_id, relationship)
VALUES ('parent-uuid', 'student-uuid', 'guardian');

INSERT INTO mentor_student_links (mentor_id, student_id)
VALUES ('mentor-uuid', 'student-uuid');

-- This will auto-create parent-mentor link
INSERT INTO parent_mentor_links (parent_id, mentor_id, student_id)
VALUES ('parent-uuid', 'mentor-uuid', 'student-uuid');
```

## Troubleshooting

### Error: "relation does not exist"
- The tables haven't been created yet
- Run the SQL migration from Option 1 or 2 above

### Error: "permission denied"
- Make sure you're using a Supabase role with admin privileges
- Or disable RLS temporarily to test

### Pages still show "Failed to load data"
- Check that backend is running on port 3001
- Check browser console for specific error messages
- Verify database tables exist in Supabase dashboard

## Next Steps

Once tables are created:
1. Use the "Link Account" page to create parent-student and student-mentor relationships
2. Parent and mentor dashboards will automatically populate with linked data
3. Auto-linking will create parent-mentor connections when both are linked to same student
