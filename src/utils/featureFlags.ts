/**
 * Feature Flag System
 * Provides runtime feature toggling for safe deployments and A/B testing
 */

import { logger } from './logger';
import { config } from '@/config/environment';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  userTypes?: ('client' | 'lawyer' | 'base')[];
  conditions?: FeatureFlagCondition[];
}

export interface FeatureFlagCondition {
  type: 'user_type' | 'user_id' | 'session_age' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | number | boolean | string[] | number[];
}

export interface FeatureFlagContext {
  userId?: string;
  userType?: 'client' | 'lawyer' | 'base';
  sessionAge?: number;
  customProperties?: Record<string, string | number | boolean>;
}

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private context: FeatureFlagContext = {};

  constructor() {
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags(): void {
    // Core feature flags
    this.registerFlag({
      key: 'base_wallet_integration',
      enabled: config.features.enableBaseWallet,
      description: 'Enable Base blockchain wallet integration',
      userTypes: ['base']
    });

    this.registerFlag({
      key: 'offline_mode',
      enabled: config.features.enableOfflineMode,
      description: 'Enable offline mode for development',
      userTypes: ['base']
    });

    this.registerFlag({
      key: 'analytics_tracking',
      enabled: config.features.enableAnalytics,
      description: 'Enable user analytics and tracking'
    });

    this.registerFlag({
      key: 'lawyer_verification',
      enabled: true,
      description: 'Require practice number verification for lawyers',
      userTypes: ['lawyer']
    });

    this.registerFlag({
      key: 'premium_features',
      enabled: false,
      description: 'Enable premium subscription features',
      rolloutPercentage: 10 // 10% rollout
    });

    this.registerFlag({
      key: 'advanced_matching',
      enabled: false,
      description: 'Enable AI-powered lawyer matching',
      rolloutPercentage: 25,
      userTypes: ['client']
    });

    this.registerFlag({
      key: 'video_consultations',
      enabled: false,
      description: 'Enable video consultation booking',
      conditions: [
        {
          type: 'user_type',
          operator: 'in',
          value: ['lawyer', 'client']
        }
      ]
    });

    this.registerFlag({
      key: 'payment_integration',
      enabled: false,
      description: 'Enable USDC payment processing',
      conditions: [
        {
          type: 'user_type',
          operator: 'equals',
          value: 'client'
        }
      ]
    });
  }

  registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    logger.debug(`Feature flag registered: ${flag.key}`, {
      action: 'feature_flag_register',
      metadata: { flag: flag.key, enabled: flag.enabled }
    });
  }

  setContext(context: Partial<FeatureFlagContext>): void {
    this.context = { ...this.context, ...context };
    logger.debug('Feature flag context updated', {
      action: 'feature_flag_context',
      metadata: { context: this.context }
    });
  }

  private evaluateConditions(conditions: FeatureFlagCondition[]): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'user_type':
          return this.evaluateCondition(this.context.userType, condition);
        case 'user_id':
          return this.evaluateCondition(this.context.userId, condition);
        case 'session_age':
          return this.evaluateCondition(this.context.sessionAge, condition);
        case 'custom':
          return this.evaluateCondition(
            this.context.customProperties?.[condition.value.property],
            { ...condition, value: condition.value.value }
          );
        default:
          return false;
      }
    });
  }

  private evaluateCondition(actualValue: string | number | boolean | undefined, condition: FeatureFlagCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'not_equals':
        return actualValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(actualValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(actualValue);
      case 'greater_than':
        return typeof actualValue === 'number' && actualValue > condition.value;
      case 'less_than':
        return typeof actualValue === 'number' && actualValue < condition.value;
      default:
        return false;
    }
  }

  private checkRolloutPercentage(percentage: number, userId?: string): boolean {
    if (!userId) {
      // Use session-based random if no user ID
      const sessionSeed = parseInt(this.context.userId || '0', 36) || Math.random() * 100;
      return sessionSeed % 100 < percentage;
    }
    
    // Consistent hash-based rollout for users
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 100 < percentage;
  }

  isEnabled(flagKey: string, context?: Partial<FeatureFlagContext>): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      logger.warn(`Feature flag not found: ${flagKey}`, {
        action: 'feature_flag_check',
        metadata: { flag: flagKey, found: false }
      });
      return false;
    }

    // Merge context
    const evalContext = { ...this.context, ...context };

    // Check base enabled state
    if (!flag.enabled) {
      return false;
    }

    // Check user type restrictions
    if (flag.userTypes && evalContext.userType) {
      if (!flag.userTypes.includes(evalContext.userType)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      if (!this.checkRolloutPercentage(flag.rolloutPercentage, evalContext.userId)) {
        return false;
      }
    }

    // Check conditions
    if (flag.conditions) {
      const tempContext = this.context;
      this.context = evalContext;
      const conditionsMet = this.evaluateConditions(flag.conditions);
      this.context = tempContext;
      
      if (!conditionsMet) {
        return false;
      }
    }

    logger.debug(`Feature flag evaluated: ${flagKey}`, {
      action: 'feature_flag_check',
      metadata: { flag: flagKey, enabled: true, context: evalContext }
    });

    return true;
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getEnabledFlags(context?: Partial<FeatureFlagContext>): string[] {
    return this.getAllFlags()
      .filter(flag => this.isEnabled(flag.key, context))
      .map(flag => flag.key);
  }

  // Runtime flag updates (for admin interfaces)
  updateFlag(flagKey: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      return false;
    }

    const updatedFlag = { ...flag, ...updates };
    this.flags.set(flagKey, updatedFlag);

    logger.info(`Feature flag updated: ${flagKey}`, {
      action: 'feature_flag_update',
      metadata: { flag: flagKey, updates }
    });

    return true;
  }
}

// Global feature flag manager
export const featureFlags = new FeatureFlagManager();

// Convenience hooks for common checks
export const useFeatureFlag = (flagKey: string, context?: Partial<FeatureFlagContext>): boolean => {
  return featureFlags.isEnabled(flagKey, context);
};

export const withFeatureFlag = <T>(
  flagKey: string,
  component: T,
  fallback?: T,
  context?: Partial<FeatureFlagContext>
): T | undefined => {
  return featureFlags.isEnabled(flagKey, context) ? component : fallback;
};