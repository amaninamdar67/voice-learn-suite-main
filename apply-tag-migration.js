import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('Checking if announcement_tag column exists...\n');
    
    // Check if column exists by trying to query it
    const { data, error } = await supabase
      .from('user_messages')
      .select('announcement_tag')
      .limit(1);
    
    if (error && error.message.includes('column')) {
      console.log('Column does not exist. Attempting to add it...');
      
      // Use rpc to execute raw SQL
      const { data: result, error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE user_messages ADD COLUMN IF NOT EXISTS announcement_tag VARCHAR(50) DEFAULT 'normal';`
      });
      
      if (rpcError) {
        console.log('RPC method not available. Please run this SQL manually in Supabase SQL Editor:');
        console.log(`
ALTER TABLE user_messages ADD COLUMN IF NOT EXISTS announcement_tag VARCHAR(50) DEFAULT 'normal';
CREATE INDEX IF NOT EXISTS idx_user_messages_announcement_tag ON user_messages(announcement_tag) WHERE message_type = 'announcement';
        `);
      } else {
        console.log('✓ Migration applied successfully!');
      }
    } else if (!error) {
      console.log('✓ announcement_tag column already exists!');
    } else {
      console.log('Error checking column:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigration();
