import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemFeatures {
  chat: boolean;
  aiTutor: boolean;
  voiceNavigation: boolean;
  discussions: boolean;
  notifications: boolean;
  videoLessons: boolean;
  quizzes: boolean;
  projects: boolean;
}

interface SystemConfigContextType {
  features: SystemFeatures;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  isFeatureEnabled: (feature: keyof SystemFeatures) => boolean;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<SystemFeatures>({
    chat: true,
    aiTutor: true,
    voiceNavigation: true,
    discussions: true,
    notifications: true,
    videoLessons: true,
    quizzes: true,
    projects: true,
  });
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/system/config');
      
      if (!response.ok) {
        console.warn('System config table may not exist. Using default values. Run database/10_system_config.sql');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.config && data.config.config_value) {
        console.log('Loaded system config:', data.config.config_value);
        setFeatures(data.config.config_value);
      }
    } catch (err) {
      console.error('Error loading system config:', err);
      console.warn('Using default feature settings. Make sure to run database/10_system_config.sql');
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    
    // Refresh config every 30 seconds to pick up changes
    const interval = setInterval(loadConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('System features updated:', features);
  }, [features]);

  const refreshConfig = async () => {
    await loadConfig();
  };

  const isFeatureEnabled = (feature: keyof SystemFeatures): boolean => {
    return features[feature] === true;
  };

  return (
    <SystemConfigContext.Provider value={{ features, loading, refreshConfig, isFeatureEnabled }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within SystemConfigProvider');
  }
  return context;
};
