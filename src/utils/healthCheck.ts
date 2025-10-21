/**
 * Health Check System
 * Monitors application health and provides diagnostic information
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { config } from '@/config/environment';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    authentication: HealthCheckResult;
    localStorage: HealthCheckResult;
    network: HealthCheckResult;
  };
  metadata: {
    version: string;
    environment: string;
    sessionId: string;
  };
}

export interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  message?: string;
  details?: Record<string, string | number | boolean | null>;
}

class HealthChecker {
  private lastCheck: HealthStatus | null = null;
  private checkInterval: number | null = null;

  async checkDatabase(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const responseTime = performance.now() - start;
      
      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: `Database error: ${error.message}`,
          details: { error: error.code }
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Database connection successful'
      };
    } catch (error) {
      const responseTime = performance.now() - start;
      return {
        status: 'fail',
        responseTime,
        message: `Database connection failed: ${(error as Error).message}`
      };
    }
  }

  async checkAuthentication(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const responseTime = performance.now() - start;

      if (error) {
        return {
          status: 'warn',
          responseTime,
          message: `Auth check warning: ${error.message}`
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: session ? 'User authenticated' : 'No active session',
        details: { hasSession: !!session }
      };
    } catch (error) {
      const responseTime = performance.now() - start;
      return {
        status: 'fail',
        responseTime,
        message: `Auth check failed: ${(error as Error).message}`
      };
    }
  }

  checkLocalStorage(): HealthCheckResult {
    const start = performance.now();
    try {
      const testKey = '__health_check_test__';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const responseTime = performance.now() - start;
      
      if (retrieved !== testValue) {
        return {
          status: 'fail',
          responseTime,
          message: 'LocalStorage read/write test failed'
        };
      }

      // Check storage usage
      const usage = this.getStorageUsage();
      const isNearLimit = usage.percentage > 80;

      return {
        status: isNearLimit ? 'warn' : 'pass',
        responseTime,
        message: isNearLimit ? 'LocalStorage usage high' : 'LocalStorage working',
        details: usage
      };
    } catch (error) {
      const responseTime = performance.now() - start;
      return {
        status: 'fail',
        responseTime,
        message: `LocalStorage check failed: ${(error as Error).message}`
      };
    }
  }

  async checkNetwork(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      // Check if we can reach Supabase
      const response = await fetch(config.supabase.url + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': config.supabase.publishableKey
        }
      });
      
      const responseTime = performance.now() - start;
      
      if (!response.ok) {
        return {
          status: 'fail',
          responseTime,
          message: `Network check failed: HTTP ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Network connectivity good'
      };
    } catch (error) {
      const responseTime = performance.now() - start;
      return {
        status: 'fail',
        responseTime,
        message: `Network check failed: ${(error as Error).message}`
      };
    }
  }

  private getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate total available (browsers typically allow 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const start = performance.now();
    
    logger.debug('Starting health check');
    
    const [database, authentication, localStorage, network] = await Promise.all([
      this.checkDatabase(),
      this.checkAuthentication(),
      Promise.resolve(this.checkLocalStorage()),
      this.checkNetwork()
    ]);

    const checks = { database, authentication, localStorage, network };
    
    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    const status: HealthStatus['status'] = hasFailures ? 'unhealthy' : 
                                          hasWarnings ? 'degraded' : 'healthy';

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      checks,
      metadata: {
        version: '1.0.0', // Could be from package.json
        environment: config.development.enableTestCredentials ? 'development' : 'production',
        sessionId: logger['sessionId'] // Access private property
      }
    };

    this.lastCheck = healthStatus;
    
    const duration = performance.now() - start;
    logger.info(`Health check completed`, {
      action: 'health_check',
      metadata: { status, duration, checks: Object.keys(checks) }
    });

    return healthStatus;
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastCheck;
  }

  startPeriodicChecks(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      this.performHealthCheck().catch(error => {
        logger.error('Periodic health check failed', { action: 'health_check' }, error);
      });
    }, intervalMs);

    logger.info('Started periodic health checks', {
      action: 'health_check',
      metadata: { intervalMs }
    });
  }

  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Stopped periodic health checks', { action: 'health_check' });
    }
  }
}

export const healthChecker = new HealthChecker();