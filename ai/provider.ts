/**
 * @fileoverview LLM provider factory with pluggable adapters.
 * @module pack/ai
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { LService, LModel, validateServiceModel } from "@ai/label";

// Support KEYGemini environment variable as the Google/Gemini API key.
// Some environments expose the Gemini key under a custom name (e.g., KEYGemini).
// Map it to the environment variables the Google SDKs commonly check:
// - `GOOGLE_GENERATIVE_AI_API_KEY` (used by Google Generative AI / Gemini)
// - `GOOGLE_API_KEY` (older/alternate name)
const _geminiKey = process.env.KEYGemini ?? process.env.KEY_GEMINI ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (_geminiKey) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = _geminiKey;
  }
  if (!process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = _geminiKey;
  }
}

interface LLMContract {
  generate(prompt: string): Promise<string>;
}

type SDKModelFn<M extends LModel> =
  (model: M) => Parameters<typeof generateText>[0]["model"];

/** SDK model initializers keyed by service */
const SDK_PROVIDERS = {
  [LService.OPENAI]: (model: LModel.GPT) => openai(model),
  [LService.GOOGLE]: (model: LModel.GEMINI) => google(model),
} satisfies {
  [LService.OPENAI]: SDKModelFn<LModel.GPT>;
  [LService.GOOGLE]: SDKModelFn<LModel.GEMINI>;
};

function createSDKAdapter(
  model: Parameters<typeof generateText>[0]["model"]
): LLMContract {
  return {
    async generate(prompt: string): Promise<string> {
      const { text } = await generateText({ model, prompt });
      return text;
    },
  };
}

const MOCK_ADAPTER: LLMContract = {
  async generate(): Promise<string> {
    // Return a minimal bash code block so extractCode can find runnable code
    // This keeps mock behavior useful for testing the loop pipeline.
    return "```bash\necho \"Mock response\"\n```";
  },
};

const SERVICE_ADAPTERS = {
  [LService.OPENAI]: (model: LModel.GPT) =>
    createSDKAdapter(SDK_PROVIDERS[LService.OPENAI](model)),

  [LService.GOOGLE]: (model: LModel.GEMINI) =>
    createSDKAdapter(SDK_PROVIDERS[LService.GOOGLE](model)),
};

// ____________________________________________________________________________
// ── Factory Function ────────────────────────────────────────────────────────
export function createLLM(
  service: LService.MOCK,
  model: LModel.MOCK
): LLMContract;

export function createLLM(
  service: LService.OPENAI,
  model: LModel.GPT
): LLMContract;

export function createLLM(
  service: LService.GOOGLE,
  model: LModel.GEMINI
): LLMContract;

export function createLLM(
  service: LService,
  model: LModel
): LLMContract;

export function createLLM(service: LService, model: LModel): LLMContract {
  // Log chosen service/model and presence of Gemini key for diagnostics
  console.info(`[LLM Provider] requested service=${service} model=${model}`);
  console.info(
    `[LLM Provider] GOOGLE_GENERATIVE_AI_API_KEY present=${Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)}`
  );

  validateServiceModel(service, model);

  if (service === LService.MOCK) return MOCK_ADAPTER;

  const create = SERVICE_ADAPTERS[service];
  if (!create) {
    throw new Error(`No SDK provider registered for service "${service}"`);
  }

  return create(model as never);
}
