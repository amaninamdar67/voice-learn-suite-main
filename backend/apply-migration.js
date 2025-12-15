import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('Applying migration: Adding default_department and default_semester to sub_domains...\n');
    
    // Execute the migration using raw SQL through Supabase
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE sub_domains
        ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
        ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);
      `
    });
    
    if (error && error.message.includes('does not exist')) {
      // If exec_sql doesn't exist, try using the query builder as a workaround
      console.log('Note: exec_sql RPC not available. Attempting alternative approach...');
      
      // We'll need to use Supabase SQL Editor manually
      console.log('Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);
      `);
      return;
    }
    
    if (error) {
      console.error('Migration error:', error);
      return;
    }
    
    console.log('✓ Migration applied successfully!');
    console.log('\nVerifying columns...');
    
    // Verify the columns were added
    const { data, error: verifyError } = await supabase
      .from('sub_domains')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      const hasDefaultDept = columns.includes('default_department');
      const hasDefaultSem = columns.includes('default_semester');
      
      console.log('Column Status:');
      console.log(`  - default_department: ${hasDefaultDept ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log(`  - default_semester: ${hasDefaultSem ? '✓ EXISTS' : '✗ MISSING'}`);
      
      if (hasDefaultDept && hasDefaultSem) {
        console.log('\n✓ All columns verified! Migration complete.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log(`
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);
    `);
  }
}

applyMigration();
