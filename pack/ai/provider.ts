/**
 * @fileoverview LLM provider factory with pluggable adapters.
 * @module pack/ai
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { LService, LModel, validateServiceModel } from "@pack/ai/label";

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
  async generate(prompt?: string): Promise<string> {
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
  validateServiceModel(service, model);

  if (service === LService.MOCK) return MOCK_ADAPTER;

  const create = SERVICE_ADAPTERS[service];
  if (!create) {
    throw new Error(`No SDK provider registered for service "${service}"`);
  }

  return create(model as never);
}
