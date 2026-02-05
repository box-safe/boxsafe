export type ModelSource = "cloud" | "local" | "both"
export type Limit = number | "infinity"

export type CloudProvider = "google" | "openai" | "anthropic"
export type ContainerEngine = "docker" | "podman"
export type NetworkMode = "none" | "bridge"
export type ContainerRuntime = "default"
export type RestartPolicy = "no" | "always"

export type LlamaModel = string
export type LlamaParameters = Record<string, never>

export type LlamaSettings = {
model:LlamaModel
parameters:LlamaParameters
}

export type LocalAIFlags = {
"useLlama.cpp":boolean
}

export type LocalAIEndpoint = {
url:string
limit:Limit
}

export type LocalAIModel = {
"Llama.cpp":LlamaSettings
}

export type ModelRotationLimits = {
maxWithMain:number
maxWithExtras:Limit
}

export type ModelRotationFlags = {
rotate:boolean
}

export type ModelRotationModels = {
extraModels:string[]
}

export type ModelRotation = ModelRotationFlags & ModelRotationModels & ModelRotationLimits

export type ExpenseLimits = {
limit:Limit
limitToken:Limit
}

export type ExpenseControl = ExpenseLimits & {
rotateModels:ModelRotation
}

export type CloudModel = {
model:string
limit:number
}

export type CloudProviderConfig = {
provider:CloudProvider
}

export type CloudAIConfigShape = CloudProviderConfig & CloudModel & {
expenseControl:ExpenseControl
}

export type ContainerResources = {
memLimit:string
cpuLimit:number
}

export type ContainerRuntimeConfig = {
network:NetworkMode
containerRuntime:ContainerRuntime
restartPolicy:RestartPolicy
}

export type ContainerSecurity = {
runRoot:boolean
}

export type ContainerConfigsShape = ContainerResources & ContainerRuntimeConfig & ContainerSecurity

export type ContainerEngineConfig = {
engine:ContainerEngine
}

export type ContainerConfigShape = ContainerEngineConfig & {
configsBox:ContainerConfigsShape
}

export type SandboxNativeConfig = {
runRoot:boolean
}

export type SandboxConfigShape = {
container:ContainerConfigShape
withoutBox:SandboxNativeConfig
}

export type CommandRun = [string, string[]] | string
export type CommandEnv = string[]

export type CommandsShape = {
runCode:CommandRun
configEnv:CommandEnv
}

export type PathRoot = string
export type PathWrite = string

export type IndicatePathShape = {
pathRoot:PathRoot
pathWrite:PathWrite

}

export interface LocalAIConfig extends LocalAIFlags, LocalAIModel, LocalAIEndpoint {}
export interface CloudAIConfig extends CloudAIConfigShape {}
export interface ContainerConfigs extends ContainerConfigsShape {}
export interface ContainerConfig extends ContainerConfigShape {}
export interface SandboxConfig extends SandboxConfigShape {}
export interface Commands extends CommandsShape {}
export interface IndicatePath extends IndicatePathShape {}

export interface BoxSafeConfig {
modelSource:ModelSource
localAI:LocalAIConfig
cloudAI:CloudAIConfig
withSandbox:boolean
sandbox:SandboxConfig
commands:Commands
indicatePath:IndicatePath
}
