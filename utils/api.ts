// API utility functions with HMAC authentication
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { ENV_CONFIG } from '../config/environment';

// HMAC Configuration
const HMAC_CONFIG = {
  ID: 'SustainibilityPortal',
  KEY: '0KEX8P1I7U9NJHKV1L7XHCVH6QI9XXCS',
  API_KEY: 'bGMxYSqsNUb6F88L9rTY3OOMCynzZKAF',
  BASE_URL: ENV_CONFIG.API_BASE_URL
};

// Function that generates both timestamp and HMAC hash together
const generateHash = (method: string): { timestamp: string; hmacHash: string } => {
  const Id = HMAC_CONFIG.ID;
  const key = HMAC_CONFIG.KEY;
  const date = new Date();
  const timestamp = moment.utc(date).format('YYYY-MM-DDTHH:mm:ss[Z]');
  
  // Create data string for the specific method
  const dataString = `${method}${Id}${timestamp}`;
  const hash = CryptoJS.HmacSHA256(dataString, key);
  const hmacHash = CryptoJS.enc.Base64.stringify(hash);
  
  return { timestamp, hmacHash };
};

// Helper function to create headers with HMAC authentication
const createHeaders = (method: string, contentType?: string, accessToken?: string): HeadersInit => {
  const headers: HeadersInit = {};
  const { timestamp, hmacHash } = generateHash(method);
  
  // Only add Content-Type for methods that have a request body
  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = contentType || 'application/json';
  }
  
  headers['Authorization'] = accessToken ? `Bearer ${accessToken}` : 'Bearer {{access_token}}';
  headers['x-apikey'] = HMAC_CONFIG.API_KEY;
  headers['Origin'] = ENV_CONFIG.ORIGIN;
  headers['requestid'] = hmacHash;
  headers['timestamp'] = timestamp;
  
  // Override browser client hints headers to restrict information
  headers['sec-ch-ua'] = '""'; // Empty user agent brand
  headers['sec-ch-ua-mobile'] = '?0'; // Force non-mobile
  headers['sec-ch-ua-platform'] = '""'; // Empty platform info
  headers['User-Agent'] = 'CustomApp/1.0'; // Override user agent
  
  return headers;
};

// GET request helper
export const apiGet = async (endpoint: string, params?: Record<string, any>, accessToken?: string): Promise<any> => {
  let url = `${HMAC_CONFIG.BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders('GET', undefined, accessToken)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// GET request helper WITHOUT Authorization header (for endpoints like /masterdata)
export const apiGetNoAuth = async (endpoint: string, params?: Record<string, any>): Promise<any> => {
  let url = `${HMAC_CONFIG.BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  // Create headers without Authorization (matching Postman exactly)
  const { timestamp, hmacHash } = generateHash('GET');
  const headers: HeadersInit = {
    'x-apikey': HMAC_CONFIG.API_KEY,
    'Origin': 'http://localhost:3000',
    'requestid': hmacHash,
    'timestamp': timestamp,
    // Override browser client hints headers to restrict information
    'sec-ch-ua': '""', // Empty user agent brand
    'sec-ch-ua-mobile': '?0', // Force non-mobile
    'sec-ch-ua-platform': '""', // Empty platform info
    'User-Agent': 'CustomApp/1.0' // Override user agent
  };
  
  const response = await fetch(url, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// POST request helper
export const apiPost = async (endpoint: string, data: any, contentType: string = 'application/json', accessToken?: string): Promise<any> => {
  const body = contentType === 'application/json' ? JSON.stringify(data) : data;
  
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: createHeaders('POST', contentType, accessToken),
    body
  });
  
  if (!response.ok) {
    // Try to get the error message from the response
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = `${errorMessage} - ${errorData.message}`;
      }
    } catch (e) {
      // If we can't parse the response, use the status text
      errorMessage = `${errorMessage} - ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// PUT request helper
export const apiPut = async (endpoint: string, data: any, contentType: string = 'application/json'): Promise<any> => {
  const body = contentType === 'application/json' ? JSON.stringify(data) : data;
  
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: createHeaders('PUT', contentType),
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// PATCH request helper
export const apiPatch = async (endpoint: string, data: any, accessToken?: string): Promise<any> => {
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: createHeaders('PATCH', 'application/json', accessToken),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// DELETE request helper
export const apiDelete = async (endpoint: string, accessToken?: string): Promise<any> => {
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: createHeaders('DELETE', undefined, accessToken)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// POST request helper with query parameters
export const apiPostWithParams = async (endpoint: string, params?: Record<string, any>, data?: any, accessToken?: string): Promise<any> => {
  let url = `${HMAC_CONFIG.BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  // Ensure we always have a valid body for POST requests
  const requestBody = data || {};
  
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders('POST', 'application/json', accessToken),
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    // Try to get the error message from the response
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = `${errorMessage} - ${errorData.message}`;
      }
    } catch (e) {
      // If we can't parse the response, use the status text
      errorMessage = `${errorMessage} - ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// For FormData requests (no Content-Type header needed)
export const apiPostFormData = async (endpoint: string, formData: FormData, accessToken?: string): Promise<Response> => {
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: createHeaders('POST', 'multipart/form-data', accessToken),
    body: formData
  });
  
  // Return the response object instead of throwing an error
  // This allows the calling code to handle validation errors properly
  return response;
};

export const apiPutFormData = async (endpoint: string, formData: FormData, accessToken?: string): Promise<Response> => {
  const response = await fetch(`${HMAC_CONFIG.BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: createHeaders('PUT', 'multipart/form-data', accessToken),
    body: formData
  });
  
  // Return the response object instead of throwing an error
  // This allows the calling code to handle validation errors properly
  return response;
};

// Test function to debug masterdata API (GET request)
export const testMasterdataAPI = async (): Promise<void> => {
  console.log('Testing /masterdata API (GET request)...');
  console.log('URL:', `${HMAC_CONFIG.BASE_URL}/masterdata`);
  
  try {
    const response = await apiGet('/masterdata');
    console.log('✅ Masterdata API Response:', response);
  } catch (error: any) {
    console.log('❌ Masterdata API Error:', error.message);
    console.log('Full error:', error);
    
    // Check if it's a specific error type
    if (error.message.includes('KVM Config Not Available')) {
      console.log('💡 This is likely a CORS issue - API works in Postman but not browser');
      console.log('💡 Backend team needs to configure CORS for /masterdata endpoint');
    } else if (error.message.includes('404')) {
      console.log('💡 Endpoint not found - /masterdata might not be deployed');
    } else if (error.message.includes('401')) {
      console.log('💡 Authentication issue - GET request might need different auth');
    } else if (error.message.includes('403')) {
      console.log('💡 Access forbidden - check permissions for GET /masterdata');
    }
  }
};

// Test masterdata API with minimal headers (CORS-safe)
export const testMasterdataCorsSafe = async (): Promise<void> => {
  console.log('Testing /masterdata API with minimal headers (CORS-safe)...');
  
  try {
    const response = await fetch(`${HMAC_CONFIG.BASE_URL}/masterdata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{access_token}}'
      }
    });
    
    console.log('Response Status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ CORS-safe request worked!');
    } else {
      console.log('❌ Even CORS-safe request failed');
    }
  } catch (error: any) {
    console.log('❌ CORS Error:', error.message);
    console.log('💡 This confirms it\'s a CORS configuration issue');
  }
};

// Test masterdata API with EXACT Postman headers (no Authorization)
export const testMasterdataExactPostman = async (): Promise<void> => {
  console.log('Testing /masterdata API with EXACT Postman headers...');
  
  try {
    const { timestamp, hmacHash } = generateHash('GET');
    
    const response = await fetch(`${HMAC_CONFIG.BASE_URL}/masterdata`, {
      method: 'GET',
      headers: {
        'x-apikey': HMAC_CONFIG.API_KEY,
        'Origin': 'http://localhost:3000',
        'requestid': hmacHash,
        'timestamp': timestamp
        // NO Authorization header - matching Postman exactly
      }
    });
    
    console.log('Response Status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Exact Postman headers worked!');
      console.log('💡 The issue was the Authorization header - /masterdata doesn\'t need it');
    } else {
      console.log('❌ Even exact Postman headers failed');
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
};

// Test HMAC generation to verify correct timestamp and method handling
export const testHMACGeneration = (): void => {
  console.log('🔍 Testing HMAC Generation...');
  console.log('HMAC Config:', HMAC_CONFIG);
  
  // Test different methods
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  methods.forEach(method => {
    const { timestamp, hmacHash } = generateHash(method);
    console.log(`\n📋 ${method} Request:`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   HMAC Hash: ${hmacHash}`);
    
    // Show the data string that was hashed
    const dataString = `${method}${HMAC_CONFIG.ID}${timestamp}`;
    console.log(`   Data String: ${dataString}`);
  });
  
  // Test the exact headers that would be sent for GET /masterdata
  console.log('\n🎯 GET /masterdata Headers:');
  const getHeaders = createHeaders('GET', undefined, '{{access_token}}');
  console.log('Headers:', getHeaders);
  
  // Test the exact headers that would be sent for POST /user
  console.log('\n🎯 POST /user Headers:');
  const postHeaders = createHeaders('POST', 'application/json', '{{access_token}}');
  console.log('Headers:', postHeaders);
};
