/**
 * Firebase Configuration Validator
 *
 * Validates that all required Firebase environment variables are properly configured.
 * This helps catch configuration issues early during development and deployment.
 */

interface FirebaseConfigValidation {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
  warnings: string[];
}

const REQUIRED_CONFIG_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const OPTIONAL_CONFIG_VARS = [
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_MEASUREMENT_ID',
] as const;

/**
 * Validates Firebase configuration environment variables
 * @returns Validation result with details about missing or invalid variables
 */
export function validateFirebaseConfig(): FirebaseConfigValidation {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_CONFIG_VARS) {
    const value = import.meta.env[varName];

    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else if (value.includes('undefined') || value.includes('YOUR_')) {
      invalidVars.push(varName);
    }
  }

  // Check optional variables (warnings only)
  for (const varName of OPTIONAL_CONFIG_VARS) {
    const value = import.meta.env[varName];

    if (!value || value.trim() === '') {
      warnings.push(`Optional variable ${varName} is not set`);
    }
  }

  // Validate specific formats
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    invalidVars.push('VITE_FIREBASE_API_KEY (should start with "AIza")');
  }

  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  if (authDomain && !authDomain.includes('firebaseapp.com')) {
    warnings.push('VITE_FIREBASE_AUTH_DOMAIN should end with ".firebaseapp.com"');
  }

  const isValid = missingVars.length === 0 && invalidVars.length === 0;

  return {
    isValid,
    missingVars,
    invalidVars,
    warnings,
  };
}

/**
 * Logs Firebase configuration validation results
 * Throws an error if configuration is invalid
 */
export function logFirebaseConfigValidation(): void {
  const validation = validateFirebaseConfig();

  if (!validation.isValid) {
    console.error('❌ Firebase Configuration Error:');

    if (validation.missingVars.length > 0) {
      console.error('Missing required environment variables:');
      validation.missingVars.forEach(v => console.error(`  - ${v}`));
    }

    if (validation.invalidVars.length > 0) {
      console.error('Invalid environment variables:');
      validation.invalidVars.forEach(v => console.error(`  - ${v}`));
    }

    console.error('\n💡 Solution:');
    console.error('1. Check your .env file in the project root');
    console.error('2. Ensure all VITE_FIREBASE_* variables are set correctly');
    console.error('3. For Azure deployment, add these variables in Azure Portal:');
    console.error('   Static Web Apps → Configuration → Application settings');

    throw new Error('Firebase configuration is invalid. Check console for details.');
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Firebase Configuration Warnings:');
    validation.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  console.log('✅ Firebase configuration validated successfully');
}

/**
 * Gets a user-friendly error message for Firebase configuration issues
 */
export function getFirebaseConfigErrorMessage(validation: FirebaseConfigValidation): string {
  if (validation.isValid) {
    return '';
  }

  const messages: string[] = [
    'Firebase is not properly configured.',
  ];

  if (validation.missingVars.length > 0) {
    messages.push(`Missing: ${validation.missingVars.join(', ')}`);
  }

  if (validation.invalidVars.length > 0) {
    messages.push(`Invalid: ${validation.invalidVars.join(', ')}`);
  }

  messages.push('Please contact the administrator to fix the configuration.');

  return messages.join(' ');
}
