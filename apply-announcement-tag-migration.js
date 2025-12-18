import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('Applying migration: Adding announcement_tag column to user_messages...\n');
    
    // Try using the query builder to add the column
    // First, let's check if the column already exists
    const { data: columns, error: checkError } = await supabase
      .from('user_messages')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking table:', checkError);
      return;
    }
    
    if (columns && columns.length > 0) {
      const hasColumn = 'announcement_tag' in columns[0];
      if (hasColumn) {
        console.log('✓ announcement_tag column already exists!');
        return;
      }
    }
    
    // Since we can't execute raw SQL directly, we need to use Supabase SQL Editor
    console.log('⚠️  The announcement_tag column needs to be added manually.');
    console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
    console.log(`
-- Add tag column to user_messages for announcement categorization
ALTER TABLE user_messages ADD COLUMN IF NOT EXISTS announcement_tag VARCHAR(50) DEFAULT 'normal';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_messages_announcement_tag ON user_messages(announcement_tag) WHERE message_type = 'announcement';

-- Add comment
COMMENT ON COLUMN user_messages.announcement_tag IS 'Tag for announcements: normal, urgent, important, etc.';
    `);
    
    console.log('\nAfter running the SQL, the migration will be complete.');
    console.log('The backend will automatically use the new column.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigration();
