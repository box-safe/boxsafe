import type { BoxSafeConfig } from "@/types";

const modelRoutes = {
  cloud: null,
  local: null,
  both: null
} as const;

const cloudProviderRoutes = {
  google: null,
  openai: null,
  anthropic: null
} as const;

const sandboxRoutes = {
  enabled: null,
  disabled: null
} as const;

const containerEngineRoutes = {
  docker: null,
  podman: null
} as const;

export const resolveRouting = (config: BoxSafeConfig) => ({
  model: modelRoutes[config.ai.source],

  cloudProvider:
    config.ai.source === "cloud" || config.ai.source === "both"
      ? cloudProviderRoutes[config.ai.cloud.provider]
      : null,

  sandbox: config.sandbox.enabled
    ? sandboxRoutes.enabled
    : sandboxRoutes.disabled,

  containerEngine: config.sandbox.enabled
    ? containerEngineRoutes[config.sandbox.engine]
    : null
});
