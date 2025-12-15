import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  try {
    console.log('Checking sub_domains table structure...\n');
    
    // Try to fetch one subdomain to see what columns are available
    const { data, error } = await supabase
      .from('sub_domains')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching subdomains:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('Available columns in sub_domains table:');
      columns.forEach(col => console.log(`  - ${col}`));
      
      const hasDefaultDept = columns.includes('default_department');
      const hasDefaultSem = columns.includes('default_semester');
      
      console.log('\nColumn Status:');
      console.log(`  - default_department: ${hasDefaultDept ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log(`  - default_semester: ${hasDefaultSem ? '✓ EXISTS' : '✗ MISSING'}`);
      
      if (!hasDefaultDept || !hasDefaultSem) {
        console.log('\n⚠️  Missing columns! You need to run the migration in Supabase SQL Editor:');
        console.log('\nRun this SQL in Supabase:');
        console.log(`
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);
        `);
      } else {
        console.log('\n✓ All required columns exist!');
      }
    } else {
      console.log('No subdomains found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkColumns();
