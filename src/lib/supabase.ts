import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Types for our database
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'mentor';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  student_id?: string;
  employee_id?: string;
  mentor_id?: string;
  grade?: string;
  section?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  department?: string;
  subjects?: string[];
  qualifications?: string;
  expertise_area?: string;
  created_at: string;
  updated_at: string;
}

export interface ParentChildRelationship {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: string;
  created_at: string;
}
