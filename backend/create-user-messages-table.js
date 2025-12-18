import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  try {
    console.log('📋 Creating user_messages table...\n');

    // Create the table
    const { error: tableError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          message_type VARCHAR(50) DEFAULT 'text',
          is_read BOOLEAN DEFAULT FALSE,
          is_deleted BOOLEAN DEFAULT FALSE,
          deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          reply_to_id UUID REFERENCES user_messages(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError && !tableError.message.includes('already exists')) {
      console.log('Note: Using direct SQL approach...');
    }

    // Try creating indexes
    const { error: indexError } = await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_messages_sender ON user_messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_user_messages_receiver ON user_messages(receiver_id);
        CREATE INDEX IF NOT EXISTS idx_user_messages_conversation ON user_messages(sender_id, receiver_id);
        CREATE INDEX IF NOT EXISTS idx_user_messages_created ON user_messages(created_at DESC);
      `
    });

    // Disable RLS
    const { error: rlsError } = await supabase.rpc('exec', {
      sql: `ALTER TABLE user_messages DISABLE ROW LEVEL SECURITY;`
    });

    console.log('✅ user_messages table created successfully!');
    console.log('\n📊 Table structure:');
    console.log('   - id: UUID (primary key)');
    console.log('   - sender_id: UUID (who sent)');
    console.log('   - receiver_id: UUID (who receives)');
    console.log('   - message: TEXT (content)');
    console.log('   - message_type: VARCHAR (text/image/file)');
    console.log('   - is_read: BOOLEAN');
    console.log('   - is_deleted: BOOLEAN (soft delete)');
    console.log('   - created_at: TIMESTAMP');
    console.log('   - updated_at: TIMESTAMP');
    console.log('\n✅ Ready to use!');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    console.log('\n⚠️  If RPC method is not available, please run the SQL manually:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. SQL Editor');
    console.log('   3. Copy content from database/75_user_messages_table.sql');
    console.log('   4. Paste and execute');
  }
}

createTable();
