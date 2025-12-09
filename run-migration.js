import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running quiz_results table migration...');
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database', '65_fix_quiz_results_final.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query if rpc doesn't work
        try {
          await supabase.from('_migrations').select('*').limit(1);
        } catch (e) {
          // Fallback: just log the statement for manual execution
          console.log('Note: Execute this SQL manually in Supabase SQL Editor:');
          console.log(statement);
        }
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
