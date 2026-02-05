import type {
  BoxSafeConfig,
  CloudAIConfig,
  ExpenseControl,
  ModelRotation,
  LocalAIConfig,
  ContainerConfigs,
  ContainerConfig,
  SandboxConfig,
  Commands,
  IndicatePath
} from "./types";

const localAI:LocalAIConfig = {
  "useLlama.cpp": false,
  "Llama.cpp": { model: "Llama.gguf", parameters: {} },
  url: "http://127.0.0.1:8080",
  limit: "infinity"
}

const rotateModels:ModelRotation = {
  rotate: false,
  extraModels: [],
  maxWithMain: 10,
  maxWithExtras: "infinity"
}

const expenseControl:ExpenseControl = {
  limit: "infinity",
  limitToken: "infinity",
  rotateModels
}

const cloudAI:CloudAIConfig = {
  provider: "google",
  model: "gemini-2.5-flash",
  limit: 10,
  expenseControl
}

const configsBox:ContainerConfigs = {
  runRoot: true,
  memLimit: "256m",
  cpuLimit: 0.3,
  network: "none",
  containerRuntime: "default",
  restartPolicy: "no"
}

const container:ContainerConfig = {
  engine: "docker",
  configsBox
}

const sandbox:SandboxConfig = {
  container,
  withoutBox: { runRoot: false }
}

const commands:Commands = {
  runCode: ["executable", [ "npm", "run", "dev" ]],
  configEnv: [ "npm", "init", "-y" ]
}

const indicatePath: IndicatePath = {
  pathRoot: "@",
  pathWrite: "@",
}

const config = {
  modelSource: "cloud",
  localAI,
  cloudAI,
  withSandbox: false,
  sandbox,
  commands,
  indicatePath
} satisfies BoxSafeConfig

export default config
