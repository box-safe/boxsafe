import type { BoxSafeConfig } from "@/types";

const modelRoutes= {
    cloud: null,
    local: null,
    both: null
} as const

const cloudProviderRoutes= {
    google: null,
    openai: null,
    anthropic: null
} as const

const sandboxRoutes= {
    enabled: null,
    disabled: null
} as const

const containerEngineRoutes= {
    docker: null,
    podman: null
} as const

export const resolveRouting = (config:BoxSafeConfig) => ({
    model:modelRoutes[config.modelSource],

    cloudProvider:config.modelSource === "cloud" || config.modelSource === "both"
    ? cloudProviderRoutes[config.cloudAI.provider]
    : null,

    sandbox:config.withSandbox
    ? sandboxRoutes.enabled
    : sandboxRoutes.disabled,

    containerEngine:config.withSandbox
    ? containerEngineRoutes[config.sandbox.container.engine]
    : null
});
