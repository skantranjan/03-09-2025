// Environment testing utility
import { ENV_CONFIG } from '../config/environment';

export const testEnvironmentDetection = (): void => {
  console.log('🧪 Testing Environment Detection...');
  console.log('Current Hostname:', window.location.hostname);
  console.log('Environment Config:', ENV_CONFIG);
  console.log('API Base URL:', ENV_CONFIG.API_BASE_URL);
  console.log('Origin:', ENV_CONFIG.ORIGIN);
  console.log('Is Production:', ENV_CONFIG.IS_PRODUCTION);
  
  // Test API endpoint construction
  const testEndpoint = '/test';
  const fullUrl = `${ENV_CONFIG.API_BASE_URL}${testEndpoint}`;
  console.log('Test API URL:', fullUrl);
  
  // Verify environment-specific behavior
  if (ENV_CONFIG.IS_PRODUCTION) {
    console.log('✅ Running in PRODUCTION mode');
    console.log('🌐 Production URL: https://sustainability-data-portal.eip.dev.haleon.com/ui');
  } else {
    console.log('✅ Running in DEVELOPMENT mode');
    console.log('🏠 Local URL: http://localhost:3000');
  }
  
  console.log('---');
};

// Function to simulate production environment for testing
export const simulateProductionEnvironment = (): void => {
  console.log('🔄 Simulating production environment...');
  
  // Override hostname temporarily for testing
  const originalHostname = window.location.hostname;
  Object.defineProperty(window.location, 'hostname', {
    value: 'sustainability-data-portal.eip.dev.haleon.com',
    writable: true
  });
  
  // Re-import to get new environment config
  import('../config/environment').then(({ ENV_CONFIG: newConfig }) => {
    console.log('New Environment Config:', newConfig);
    console.log('API Base URL:', newConfig.API_BASE_URL);
    console.log('Is Production:', newConfig.IS_PRODUCTION);
    
    // Restore original hostname
    Object.defineProperty(window.location, 'hostname', {
      value: originalHostname,
      writable: true
    });
  });
};
