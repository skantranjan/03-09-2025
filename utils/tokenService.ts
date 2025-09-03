import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

// Token utility functions (no singleton needed)
export class TokenUtils {
  // Check if token is expiring soon (within 5 minutes)
  static isTokenExpiring(token: string): boolean {
    try {
      // Handle different token formats
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid JWT token format');
        return true; // Assume expired if can't parse
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Refresh if token expires in next 5 minutes
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch (error) {
      console.warn('Could not parse token, assuming expired:', error);
      return true; // If can't parse, assume expired
    }
  }

  // Validate token with Microsoft Graph
  static async validateTokenWithGraph(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

// Hook for token operations
export const useTokenService = () => {
  const { instance } = useMsal();

  // Get fresh token (refresh if needed)
  const getFreshToken = async (account: any): Promise<string> => {
    try {
      console.log('🔄 Getting fresh token...');
      
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });

      if (response.accessToken) {
        console.log('✅ Fresh token obtained');
        return response.accessToken;
      } else {
        throw new Error('No access token received');
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      
      // If silent refresh fails, try interactive login
      if (error.errorCode === 'consent_required' || 
          error.errorCode === 'interaction_required' ||
          error.errorCode === 'login_required') {
        
        console.log('🔄 Silent refresh failed, trying interactive login...');
        
        try {
          const interactiveResponse = await instance.loginPopup(loginRequest);
          if (interactiveResponse.accessToken) {
            console.log('✅ Interactive login successful');
            return interactiveResponse.accessToken;
          }
        } catch (interactiveError) {
          console.error('❌ Interactive login failed:', interactiveError);
          throw new Error('Token refresh failed. Please login again.');
        }
      }
      
      throw new Error('Token refresh failed. Please login again.');
    }
  };

  return {
    isTokenExpiring: TokenUtils.isTokenExpiring,
    getFreshToken,
    validateTokenWithGraph: TokenUtils.validateTokenWithGraph
  };
};
