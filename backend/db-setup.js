// Database setup and migrations
export const initializeDatabase = async (supabase) => {
  try {
    console.log('Initializing database...');
    
    // Verify quiz_results table exists
    const { data: quizTable, error: tableError } = await supabase
      .from('quiz_results')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code !== 'PGRST116') {
      console.warn('⚠️  Quiz results table check failed:', tableError.message);
      console.log('IMPORTANT: Run this in Supabase SQL Editor to fix quiz submissions:');
      console.log('ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✓ Quiz results table verified');
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't fail startup, just warn
  }
};
