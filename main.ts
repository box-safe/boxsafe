/**
 * @fileoverview Parses boxsf.json and drives library behavior based on the resolved configuration.
 * @module core
 */
import "dotenv/config";
import { loop } from "@core/loop/execLoop";
import { LService, LModel } from "@pack/ai/label";

function parseService(raw?: string): LService {
  if (!raw) return LService.MOCK;
  const s = raw.toLowerCase();
  if (s.includes("open")) return LService.OPENAI;
  if (s.includes("google") || s.includes("gemini")) return LService.GOOGLE;
  return LService.MOCK;
}

function parseModel(raw?: string): LModel {
  if (!raw) return LModel.MOCK;
  const s = raw.toLowerCase();
  if (s.includes("gpt") || s.includes("4o")) return LModel.GPT;
  if (s.includes("gemini")) return LModel.GEMINI;
  return LModel.MOCK;
}

// If the user didn't set AI_SERVICE but provided a Gemini key, prefer Google
const inferredService = process.env.AI_SERVICE ?? (process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'google' : undefined) ?? process.env.AI_SPEC?.split(":")[0];
let inferredModel = process.env.AI_MODEL ?? process.env.AI_SPEC?.split(":")[1];

// If service was inferred as Google and no model provided, default to Gemini
if (!inferredModel && inferredService === 'google') {
  inferredModel = 'gemini';
}

const service = parseService(inferredService);
const model = parseModel(inferredModel);

const initialPrompt = process.env.INITIAL_PROMPT || "Escreva um programa para verificar o hardware do usuario e imprimir informações sobre no terminal";

// ════════════════════════════════════════════════════════════════
// 🔧 CORREÇÃO: Usar tsx para executar TypeScript
// ════════════════════════════════════════════════════════════════
const pathOutput = process.env.PATH_OUTPUT || "./output.ts";
const lang = process.env.CODE_LANG || process.env.BOXSAFE_LANG || "ts";

// Auto-detectar comando baseado na linguagem e extensão do arquivo
function buildExecutionCommand(filepath: string, language: string): string {
  const ext = filepath.split('.').pop()?.toLowerCase();
  
  // TypeScript
  if (language === 'ts' || ext === 'ts') {
    return `pnpm tsx ${filepath}`;
  }
  
  // JavaScript
  if (language === 'js' || ext === 'js') {
    return `node ${filepath}`;
  }
  
  // Python
  if (language === 'py' || language === 'python' || ext === 'py') {
    return `python3 ${filepath}`;
  }
  
  // Fallback para o padrão antigo
  return process.env.CMD || `echo "Unsupported language: ${language}"`;
}

const cmd = process.env.CMD 
  ? (process.env.CMD.startsWith("[") ? JSON.parse(process.env.CMD) : process.env.CMD)
  : buildExecutionCommand(pathOutput, lang);

console.log(`[Main] Execution command: ${cmd}`);

// Call loop with constructed options
loop({ service, model, initialPrompt, cmd, lang, pathOutput }).catch((err) => {
  console.error("[loop] error:", err);
  process.exitCode = 1;
});