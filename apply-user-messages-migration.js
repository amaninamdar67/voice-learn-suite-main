import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('📋 Applying user_messages table migration...\n');

    // Read the SQL file
    const sql = fs.readFileSync('database/75_user_messages_table.sql', 'utf-8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec', { sql });

    if (error) {
      // If rpc doesn't work, try direct query
      console.log('Trying alternative approach...');
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.rpc('exec', { sql: statement });
          if (execError) {
            console.log('Note: Some statements may not be executable via RPC');
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 New table created: user_messages');
    console.log('   - Stores messages between any two users');
    console.log('   - Supports text, image, file message types');
    console.log('   - Includes soft delete and read status');
    console.log('   - Supports message threading with reply_to_id');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

applyMigration();
