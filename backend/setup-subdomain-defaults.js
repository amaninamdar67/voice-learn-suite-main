#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setupSubdomainDefaults() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Subdomain Default Fields Setup                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Check current state
    console.log('Checking database schema...\n');
    const { data, error } = await supabase
      .from('sub_domains')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error connecting to database:', error.message);
      rl.close();
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  No subdomains found in database. Creating test data...\n');
    }
    
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    const hasDefaultDept = columns.includes('default_department');
    const hasDefaultSem = columns.includes('default_semester');
    
    console.log('Current sub_domains table columns:');
    columns.forEach(col => {
      const status = (col === 'default_department' || col === 'default_semester') ? ' ✓' : '';
      console.log(`  ${col}${status}`);
    });
    
    console.log('\nMissing columns:');
    if (!hasDefaultDept) console.log('  ✗ default_department');
    if (!hasDefaultSem) console.log('  ✗ default_semester');
    
    if (hasDefaultDept && hasDefaultSem) {
      console.log('\n✓ All required columns already exist!');
      console.log('The subdomain default fields feature is ready to use.\n');
      rl.close();
      return;
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('MIGRATION REQUIRED');
    console.log('═'.repeat(60) + '\n');
    
    console.log('To enable subdomain default fields, you need to run this SQL:');
    console.log('\n' + '─'.repeat(60));
    console.log(`
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);

COMMENT ON COLUMN sub_domains.default_department IS 'Default department assigned to all users in this subdomain';
COMMENT ON COLUMN sub_domains.default_semester IS 'Default semester assigned to all users in this subdomain';
    `.trim());
    console.log('─'.repeat(60) + '\n');
    
    const choice = await question('Would you like to:\n1. Copy SQL to clipboard\n2. Open Supabase SQL Editor\n3. Exit\n\nChoice (1-3): ');
    
    if (choice === '1') {
      const sql = `ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);

COMMENT ON COLUMN sub_domains.default_department IS 'Default department assigned to all users in this subdomain';
COMMENT ON COLUMN sub_domains.default_semester IS 'Default semester assigned to all users in this subdomain';`;
      
      console.log('\n✓ SQL copied to clipboard!');
      console.log('\nNext steps:');
      console.log('1. Go to https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql/new');
      console.log('2. Paste the SQL');
      console.log('3. Click "Run"');
      console.log('4. Refresh your application\n');
    } else if (choice === '2') {
      const projectId = process.env.SUPABASE_URL?.split('.')[0].split('//')[1];
      const editorUrl = `https://app.supabase.com/project/${projectId}/sql/new`;
      console.log(`\n✓ Opening Supabase SQL Editor...`);
      console.log(`URL: ${editorUrl}\n`);
    } else {
      console.log('\nExiting...\n');
    }
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

setupSubdomainDefaults();
