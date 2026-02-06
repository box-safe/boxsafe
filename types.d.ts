export type ModelSource = "cloud" | "local" | "both"
export type Limit = number | "infinity"

export type CloudProvider = "google" | "openai" | "anthropic"
export type ContainerEngine = "docker" | "podman"
export type NetworkMode = "none" | "bridge"
export type ContainerRuntime = "default"
export type RestartPolicy = "no" | "always"

export type LlamaModel = string
export type LlamaParameters = Record<string, never>

export type LocalAIConfig = {
  enabled: boolean
  endpoint: string
  model: LlamaModel
  parameters: LlamaParameters
  limits: {
    requests: Limit
  }
}

export type ModelRotationConfig = {
  enabled: boolean
  extras: string[]
  maxMain: number
  maxExtras: Limit
}

export type CloudAIConfig = {
  provider: CloudProvider
  model: string
  limits: {
    requests: number
    tokens: Limit
  }
  modelRotation: ModelRotationConfig
}

export type ContainerConfig = {
  root: boolean
  memory: string
  cpu: number
  network: NetworkMode
  runtime: ContainerRuntime
  restart: RestartPolicy
}

export type SandboxConfig = {
  enabled: boolean
  engine: ContainerEngine
  container: ContainerConfig
}

export type CommandRun = [string, string[]] | string
export type CommandSetup = string[]

export type Commands = {
  run: CommandRun
  setup: CommandSetup
}

export type PathsConfig = {
  root: string
  write: string
}

export interface BoxSafeConfig {
  ai: {
    source: ModelSource
    local: LocalAIConfig
    cloud: CloudAIConfig
  }
  sandbox: SandboxConfig
  commands: Commands
  paths: PathsConfig
}
