// Secure Session Management Utility
// Provides different security levels for penetration testing

export enum SecurityLevel {
  LOW = 'low',           // localStorage (vulnerable to XSS)
  MEDIUM = 'medium',     // sessionStorage (better, still vulnerable to XSS)
  HIGH = 'high',         // Memory only (most secure, no persistence)
  PRODUCTION = 'production' // httpOnly cookies (backend managed)
}

class SecureSessionManager {
  private securityLevel: SecurityLevel;
  private memoryStorage: Map<string, any> = new Map();

  constructor(level: SecurityLevel = SecurityLevel.MEDIUM) {
    this.securityLevel = level;
    this.validateSecurityLevel();
  }

  private validateSecurityLevel() {
    // In production, force HIGH security
    if (process.env.NODE_ENV === 'production') {
      this.securityLevel = SecurityLevel.HIGH;
      console.warn('Production environment: Forcing HIGH security level');
    }
  }

  setSecurityLevel(level: SecurityLevel) {
    this.securityLevel = level;
    console.log(`Security level changed to: ${level}`);
  }

  setItem(key: string, value: any): boolean {
    try {
      switch (this.securityLevel) {
        case SecurityLevel.LOW:
          localStorage.setItem(key, JSON.stringify(value));
          break;
        
        case SecurityLevel.MEDIUM:
          sessionStorage.setItem(key, JSON.stringify(value));
          break;
        
        case SecurityLevel.HIGH:
        case SecurityLevel.PRODUCTION:
          this.memoryStorage.set(key, value);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  getItem(key: string): any {
    try {
      switch (this.securityLevel) {
        case SecurityLevel.LOW:
          const localValue = localStorage.getItem(key);
          return localValue ? JSON.parse(localValue) : null;
        
        case SecurityLevel.MEDIUM:
          const sessionValue = sessionStorage.getItem(key);
          return sessionValue ? JSON.parse(sessionValue) : null;
        
        case SecurityLevel.HIGH:
        case SecurityLevel.PRODUCTION:
          return this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  removeItem(key: string): boolean {
    try {
      switch (this.securityLevel) {
        case SecurityLevel.LOW:
          localStorage.removeItem(key);
          break;
        
        case SecurityLevel.MEDIUM:
          sessionStorage.removeItem(key);
          break;
        
        case SecurityLevel.HIGH:
        case SecurityLevel.PRODUCTION:
          this.memoryStorage.delete(key);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      switch (this.securityLevel) {
        case SecurityLevel.LOW:
          localStorage.clear();
          break;
        
        case SecurityLevel.MEDIUM:
          sessionStorage.clear();
          break;
        
        case SecurityLevel.HIGH:
        case SecurityLevel.PRODUCTION:
          this.memoryStorage.clear();
          break;
      }
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // Security assessment methods
  getSecurityAssessment() {
    const risks = [];
    
    switch (this.securityLevel) {
      case SecurityLevel.LOW:
        risks.push('XSS Vulnerable', 'CSRF Vulnerable', 'Persistent Storage', 'Data Exposure');
        break;
      
      case SecurityLevel.MEDIUM:
        risks.push('XSS Vulnerable', 'CSRF Vulnerable', 'Tab-based Storage');
        break;
      
      case SecurityLevel.HIGH:
        risks.push('XSS Vulnerable', 'No Persistence', 'Session Loss on Refresh');
        break;
      
      case SecurityLevel.PRODUCTION:
        risks.push('Backend Dependent', 'Requires HTTPS');
        break;
    }

    return {
      level: this.securityLevel,
      risks,
      recommendations: this.getSecurityRecommendations(),
      penetrationTestReady: this.securityLevel !== SecurityLevel.LOW
    };
  }

  private getSecurityRecommendations() {
    const recommendations = [];
    
    if (this.securityLevel === SecurityLevel.LOW) {
      recommendations.push(
        'Upgrade to MEDIUM or HIGH security level',
        'Implement Content Security Policy (CSP)',
        'Use httpOnly cookies for sensitive data',
        'Implement proper XSS protection'
      );
    }
    
    if (this.securityLevel === SecurityLevel.MEDIUM) {
      recommendations.push(
        'Consider HIGH security for sensitive applications',
        'Implement CSP headers',
        'Use secure and httpOnly cookies where possible'
      );
    }
    
    if (this.securityLevel === SecurityLevel.HIGH) {
      recommendations.push(
        'Implement proper session timeout',
        'Use secure token refresh mechanisms',
        'Consider backend session management'
      );
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const secureSession = new SecureSessionManager();

// Export for testing different security levels
export const createSecureSession = (level: SecurityLevel) => new SecureSessionManager(level);
