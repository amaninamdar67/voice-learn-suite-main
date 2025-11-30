// Quick script to view your database data
// Run: node view-database.js

const SUPABASE_URL = 'https://vxmrduwrmdmiwwzkcxtt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXJkdXdybWRtaXd3emtjeHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTk3MzUsImV4cCI6MjA3OTg5NTczNX0.1aypLlb4oBf8xw6W4NaZEmkT2ZxZn6TjdnBruRE6apc';

async function viewTable(tableName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  
  const data = await response.json();
  console.log(`\n=== ${tableName.toUpperCase()} ===`);
  console.table(data);
  return data;
}

async function main() {
  console.log('📊 Viewing Database Contents...\n');
  
  await viewTable('domains');
  await viewTable('subdomains');
  await viewTable('departments');
  await viewTable('semesters');
  await viewTable('profiles');
  
  console.log('\n✅ Done! View your data above.');
}

main().catch(console.error);
