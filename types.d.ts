// Types aligned with BS.config.json

export type Limit = number | "infinity";

export interface ProjectConfig {
  workspace?: string;
  testDir?: string;
  versionControl?: {
    before?: boolean;
    after?: boolean;
    autoPush?: boolean;
    generateNotes?: boolean;
  };
}

export interface ModelPrimary {
  provider: string;
  name: string;
}

export interface ModelConfig {
  primary?: ModelPrimary;
  fallback?: unknown[];
  endpoint?: string | null;
  parameters?: Record<string, unknown>;
}

export interface SmartRotationConfig {
  enabled?: boolean;
  simple?: unknown[];
  complex?: unknown[];
}

export interface TimeoutConfig {
  enabled?: boolean;
  duration?: string;
  notify?: boolean;
}

export interface LimitsConfig {
  tokens?: number;
  loops?: Limit;
  timeout?: TimeoutConfig;
}

export interface SandboxConfig {
  enabled?: boolean;
  engine?: string;
  memory?: string;
  cpu?: number;
  network?: string;
}

export type CommandRun = string | [string, string[]];

export interface CommandsConfig {
  setup?: string | null;
  run?: string | null;
  test?: string | null;
}

export interface InterfaceNotifications {
  whatsapp?: boolean;
  telegram?: boolean;
  slack?: boolean;
  email?: boolean;
}

export interface InterfaceConfig {
  channel?: string;
  prompt?: string | null;
  notifications?: InterfaceNotifications;
}

export interface TeachConfig {
  urls?: string[];
  files?: string[];
}

export interface BoxSafeConfig {
  project?: ProjectConfig;
  model?: ModelConfig;
  smartRotation?: SmartRotationConfig;
  limits?: LimitsConfig;
  sandbox?: SandboxConfig;
  commands?: CommandsConfig;
  interface?: InterfaceConfig;
  teach?: TeachConfig;
}
