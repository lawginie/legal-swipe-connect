/**
 * Environment Configuration
 * Centralized configuration management with proper secrets handling
 */

export interface AppConfig {
  supabase: {
    url: string;
    publishableKey: string;
    projectId: string;
  };
  mongodb: {
    uri: string;
    dbName: string;
  };
  api: {
    port: number;
    jwtSecret: string;
    baseUrl: string;
  };
  development: {
    enableTestCredentials: boolean;
    testCredentials?: {
      base: { email: string; password: string; fullName: string; userType: 'client' };
      client: { email: string; password: string; fullName: string; userType: 'client' };
      lawyer: { email: string; password: string; fullName: string; userType: 'lawyer' };
    };
    baseWallet?: {
      accessToken: string;
      refreshToken: string;
    };
  };
  features: {
    enableBaseWallet: boolean;
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
    enableMongoDB: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
  };
}

// Helper function to get environment variables in both browser and server contexts
const getEnvVar = (key: string): string | undefined => {
  // In browser (Vite), use import.meta.env
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key];
  }
  // In Node.js, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Environment validation function
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PROJECT_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !getEnvVar(varName));
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Configuration object
export const config: AppConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL')!,
    publishableKey: getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY')!,
    projectId: getEnvVar('VITE_SUPABASE_PROJECT_ID')!,
  },
  mongodb: {
    uri: getEnvVar('MONGODB_URI') || "mongodb://localhost:27017/legal-swipe-connect",
    dbName: getEnvVar('MONGODB_DB_NAME') || "legal-swipe-connect",
  },
  api: {
    port: parseInt(getEnvVar('API_PORT') || "3001"),
    jwtSecret: getEnvVar('JWT_SECRET') || "default-jwt-secret",
    baseUrl: getEnvVar('VITE_API_BASE_URL') || "http://localhost:3001/api",
  },
  development: {
    enableTestCredentials: getEnvVar('NODE_ENV') === 'development',
    ...(getEnvVar('NODE_ENV') === 'development' && {
      testCredentials: {
        base: {
          email: getEnvVar('VITE_DEV_BASE_EMAIL') || "admin@test.com",
          password: getEnvVar('VITE_DEV_BASE_PASSWORD') || "admin123",
          fullName: getEnvVar('VITE_DEV_BASE_NAME') || "Base Admin",
          userType: "client" as const
        },
        client: {
          email: getEnvVar('VITE_DEV_CLIENT_EMAIL') || "client@test.com",
          password: getEnvVar('VITE_DEV_CLIENT_PASSWORD') || "password123",
          fullName: getEnvVar('VITE_DEV_CLIENT_NAME') || "John Client",
          userType: "client" as const
        },
        lawyer: {
          email: getEnvVar('VITE_DEV_LAWYER_EMAIL') || "lawyer@test.com",
          password: getEnvVar('VITE_DEV_LAWYER_PASSWORD') || "password123",
          fullName: getEnvVar('VITE_DEV_LAWYER_NAME') || "Sarah Lawyer",
          userType: "lawyer" as const
        }
      },
      baseWallet: {
        accessToken: getEnvVar('VITE_DEV_BASE_ACCESS_TOKEN') || "base-local-token",
        refreshToken: getEnvVar('VITE_DEV_BASE_REFRESH_TOKEN') || "base-local-refresh"
      }
    })
  },
  features: {
    enableBaseWallet: getEnvVar('VITE_ENABLE_BASE_WALLET') !== 'false',
    enableOfflineMode: getEnvVar('VITE_ENABLE_OFFLINE_MODE') === 'true',
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS') === 'true',
    enableMongoDB: getEnvVar('VITE_ENABLE_MONGODB') !== 'false',
  },
  logging: {
    level: (getEnvVar('VITE_LOG_LEVEL') as AppConfig['logging']['level']) || 'info',
    enableConsole: getEnvVar('VITE_LOG_CONSOLE') !== 'false',
    enableRemote: getEnvVar('VITE_LOG_REMOTE') === 'true',
  }
};

// Feature flag helper
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

// Environment helper
export const isDevelopment = (): boolean => getEnvVar('NODE_ENV') === 'development';
export const isProduction = (): boolean => getEnvVar('NODE_ENV') === 'production';