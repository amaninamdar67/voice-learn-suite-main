import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVarunRole() {
  try {
    console.log('Fixing Varun\'s role from mentor back to teacher...');
    
    // Find Varun
    const { data: varun, error: findError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .ilike('full_name', '%varun%')
      .single();
    
    if (findError) {
      console.error('Error finding Varun:', findError);
      return;
    }
    
    if (!varun) {
      console.log('Varun not found');
      return;
    }
    
    console.log(`Found: ${varun.full_name} (${varun.id}) - Current role: ${varun.role}`);
    
    // Update role to teacher
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'teacher' })
      .eq('id', varun.id);
    
    if (updateError) {
      console.error('Error updating role:', updateError);
      return;
    }
    
    console.log('✓ Varun\'s role updated to teacher');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixVarunRole();
