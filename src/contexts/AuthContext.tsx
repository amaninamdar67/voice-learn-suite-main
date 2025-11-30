import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, profile: Partial<Profile>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        // Check if user's domain is active
        if (profile.domain_id) {
          const { data: domain } = await supabase
            .from('domains')
            .select('is_active')
            .eq('id', profile.domain_id)
            .single();

          if (domain && !domain.is_active) {
            // Domain is inactive - logout and throw error
            await supabase.auth.signOut();
            throw new Error('Your organization/domain is currently inactive. Please contact your administrator.');
          }
        }

        const { data: authUser } = await supabase.auth.getUser();
        setUser({
          id: profile.id,
          name: profile.full_name,
          email: authUser.user?.email || '',
          role: profile.role as UserRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error; // Re-throw to show error message
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('AuthContext.login called with email:', email);
    setLoading(true);
    try {
      console.log('Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data: !!data, error });
      if (error) throw error;
      if (data.user) {
        console.log('User authenticated, loading profile...');
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Login error in AuthContext:', error);
      setLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, profile: Partial<Profile>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            ...profile,
          }]);

        if (profileError) throw profileError;
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
