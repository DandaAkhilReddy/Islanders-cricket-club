/**
 * Centralized application configuration
 * All environment variables and app constants in one place
 */

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

// Check if running in development mode
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Validate environment variables in development
if (isDevelopment) {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );
  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file'
    );
  }
}

/**
 * Firebase Configuration
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
} as const;

/**
 * Azure Storage Configuration
 */
export const azureConfig = {
  accountName: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME,
  sasToken: import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN,
  containerName: 'islandersdata',
  photosPrefix: 'photos/',
} as const;

/**
 * AI/Gemini Configuration
 */
export const aiConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  model: 'gemini-pro',
  enabled: !!import.meta.env.VITE_GEMINI_API_KEY,
} as const;

/**
 * Application Configuration
 */
export const appConfig = {
  name: 'Islanders Cricket Club',
  shortName: 'Islanders',
  description: 'Official cricket team management and live scoring app',
  version: '1.0.0',
  supportEmail: 'canderson@hssmedicine.com',

  // Feature flags
  features: {
    messaging: true,
    aiAnalysis: aiConfig.enabled,
    offlineMode: true,
    pushNotifications: false, // TODO: Enable when ready
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },

  // Cache Configuration
  cache: {
    imageMaxAge: 60 * 60 * 24 * 30, // 30 days
    dataMaxAge: 60 * 5, // 5 minutes
    maxEntries: 100,
  },

  // Admin Configuration
  adminEmails: ['akhilreddydanda3@gmail.com'],

  // UI Configuration
  ui: {
    toastDuration: 3000, // 3 seconds
    loadingDelay: 200, // Show loading after 200ms
    skeletonMinDisplay: 500, // Minimum skeleton display time
  },
} as const;

/**
 * Route Configuration
 */
export const routes = {
  home: '/',
  login: '/login',
  profile: '/profile',
  claimProfile: '/claim-profile',

  // Player routes
  player: {
    dashboard: '/player/dashboard',
  },

  // Admin routes
  admin: {
    dashboard: '/admin',
    players: '/admin/players',
    matches: '/admin/matches',
    practice: '/admin/practice',
    equipment: '/admin/equipment',
    budget: '/admin/budget',
    communications: '/admin/communications',
    requests: '/admin/requests',
  },

  // Scorer routes
  scorer: {
    home: '/scorer',
    liveMatch: (id: string) => `/scorer/match/${id}`,
  },

  // Public routes
  squad: '/squad',
  leadership: '/leadership',
  matches: '/matches',
  practice: '/practice',
  equipment: '/equipment',
  budget: '/budget',
  communications: '/communications',
  messenger: '/messenger',
  liveMatch: (id: string) => `/live/${id}`,
} as const;

/**
 * Validation helpers
 */
export const validation = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  minPasswordLength: 8,
} as const;

// Export helper to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof appConfig.features): boolean => {
  return appConfig.features[feature];
};

// Export helper to get config value safely
export const getConfig = <T extends keyof typeof appConfig>(key: T): typeof appConfig[T] => {
  return appConfig[key];
};
