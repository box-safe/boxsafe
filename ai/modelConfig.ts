/**
 * Model Configuration - BoxSafe
 * 
 * Centralized system for managing model profiles
 * with capabilities, costs, and prompt strategies.
 */

export enum ModelCapability {
  LOW = 'low',        // < 8k tokens (Llama 7B, local models)
  MEDIUM = 'medium',  // 8k-32k tokens (GPT-3.5, Claude Haiku)
  HIGH = 'high',      // 32k-128k tokens (GPT-4, Claude Sonnet)
  EXCELLENT = 'excellent' // >128k tokens (GPT-4 Turbo, Claude Opus)
}

export interface ModelProfile {
  name: string;
  capability: ModelCapability;
  maxTokens: number;
  reminderFrequency: number; // interactions before reminder
  contextThreshold: number; // % context usage for reminder trigger
  costPerToken?: number; // for cost optimization
  provider: 'local' | 'openai' | 'anthropic' | 'google';
  description?: string;
}

/**
 * Known model profiles catalog
 * Easily extensible for new models
 */
export const MODEL_PROFILES: Record<string, ModelProfile> = {
  // === LOCAL MODELS ===
  'llama-7b': {
    name: 'Llama 7B',
    capability: ModelCapability.LOW,
    maxTokens: 8192,
    reminderFrequency: 3, // Remind every 3 interactions
    contextThreshold: 60, // Remind when using 60% of context
    provider: 'local',
    description: 'Efficient local model for simple tasks'
  },
  'llama-13b': {
    name: 'Llama 13B',
    capability: ModelCapability.LOW,
    maxTokens: 8192,
    reminderFrequency: 2, // More frequent due to higher capability
    contextThreshold: 50,
    provider: 'local',
    description: 'Local model with more capability than Llama 7B'
  },
  'mistral-7b': {
    name: 'Mistral 7B',
    capability: ModelCapability.MEDIUM,
    maxTokens: 16384,
    reminderFrequency: 5,
    contextThreshold: 70,
    provider: 'local',
    description: 'Local model with good cost-benefit ratio'
  },
  'codellama-34b': {
    name: 'CodeLlama 34B',
    capability: ModelCapability.MEDIUM,
    maxTokens: 16384,
    reminderFrequency: 4,
    contextThreshold: 65,
    provider: 'local',
    description: 'Local model specialized in code'
  },
  
  // === OPENAI ===
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    capability: ModelCapability.MEDIUM,
    maxTokens: 16384,
    reminderFrequency: 8,
    contextThreshold: 75,
    costPerToken: 0.0000015,
    provider: 'openai',
    description: 'Fast and economical model for production'
  },
  'gpt-4': {
    name: 'GPT-4',
    capability: ModelCapability.HIGH,
    maxTokens: 32768,
    reminderFrequency: 15,
    contextThreshold: 85,
    costPerToken: 0.00003,
    provider: 'openai',
    description: 'High reasoning capability'
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    capability: ModelCapability.EXCELLENT,
    maxTokens: 128000,
    reminderFrequency: 25,
    contextThreshold: 90,
    costPerToken: 0.00001,
    provider: 'openai',
    description: 'Maximum performance with optimized cost'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    capability: ModelCapability.EXCELLENT,
    maxTokens: 128000,
    reminderFrequency: 30,
    contextThreshold: 90,
    costPerToken: 0.000005,
    provider: 'openai',
    description: 'Latest model with excellent cost-benefit'
  },
  
  // === ANTHROPIC ===
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    capability: ModelCapability.MEDIUM,
    maxTokens: 200000,
    reminderFrequency: 10,
    contextThreshold: 80,
    costPerToken: 0.00000025,
    provider: 'anthropic',
    description: 'Fast and economical for simple tasks'
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    capability: ModelCapability.HIGH,
    maxTokens: 200000,
    reminderFrequency: 20,
    contextThreshold: 85,
    costPerToken: 0.000003,
    provider: 'anthropic',
    description: 'Excellent for complex code'
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    capability: ModelCapability.EXCELLENT,
    maxTokens: 200000,
    reminderFrequency: 25,
    contextThreshold: 90,
    costPerToken: 0.000015,
    provider: 'anthropic',
    description: 'Maximum capability for critical tasks'
  },
  
  // === GOOGLE ===
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    capability: ModelCapability.MEDIUM,
    maxTokens: 1048576,
    reminderFrequency: 7,
    contextThreshold: 75,
    costPerToken: 0.000000075,
    provider: 'google',
    description: 'Fast and economical from Google'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    capability: ModelCapability.HIGH,
    maxTokens: 2097152,
    reminderFrequency: 18,
    contextThreshold: 85,
    costPerToken: 0.00000125,
    provider: 'google',
    description: 'High capability from Gemini Pro'
  },
};

/**
 * Utilities for model management
 */
export class ModelConfigManager {
  
  /**
   * Gets model profile with safe fallback
   */
  static getModelProfile(modelName: string): ModelProfile {
    const profile = MODEL_PROFILES[modelName];
    if (!profile) {
      console.warn(`Model ${modelName} not found, using default GPT-3.5 Turbo`);
      return MODEL_PROFILES['gpt-3.5-turbo'] as ModelProfile;
    }
    return profile;
  }
  
  /**
   * Lists all models by capability
   */
  static getModelsByCapability(capability: ModelCapability): ModelProfile[] {
    return Object.values(MODEL_PROFILES).filter(model => model.capability === capability);
  }
  
  /**
   * Lists all models by provider
   */
  static getModelsByProvider(provider: string): ModelProfile[] {
    return Object.values(MODEL_PROFILES).filter(model => model.provider === provider);
  }
  
  /**
   * Calculates estimated cost for an interaction
   */
  static estimateCost(modelName: string, tokenCount: number): number {
    const profile = this.getModelProfile(modelName);
    return profile.costPerToken ? tokenCount * profile.costPerToken : 0;
  }
  
  /**
   * Checks if model is local vs API
   */
  static isLocalModel(modelName: string): boolean {
    const profile = this.getModelProfile(modelName);
    return profile.provider === 'local';
  }
  
  /**
   * Gets usage recommendations based on profile
   */
  static getRecommendations(modelName: string): {
    maxPromptLength: number;
    reminderFrequency: string;
    costOptimization: string;
  } {
    const profile = this.getModelProfile(modelName);
    
    return {
      maxPromptLength: Math.floor(profile.maxTokens * 0.7), // Leave 30% for response
      reminderFrequency: `Every ${profile.reminderFrequency} interactions`,
      costOptimization: profile.costPerToken 
        ? `Cost: ${(profile.costPerToken * 1000).toFixed(6)} per 1k tokens`
        : 'Local model - no costs'
    };
  }
}

/**
 * Default configuration for new models
 */
export const DEFAULT_MODEL_CONFIG: ModelProfile = MODEL_PROFILES['gpt-3.5-turbo']!;
