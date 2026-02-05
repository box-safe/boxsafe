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

type SDKModelFn = (model: string) => Parameters<typeof generateText>[0]["model"];

/** SDK model initializers keyed by service */
const SDK_PROVIDERS: Partial<Record<LService, SDKModelFn>> = {
  [LService.OPENAI]: (model) => openai(model),
  [LService.GOOGLE]: (model) => google(model),
};

function createSDKAdapter(model: Parameters<typeof generateText>[0]["model"]): LLMContract {
  return {
    async generate(prompt: string): Promise<string> {
      const { text } = await generateText({ model, prompt });
      return text;
    },
  };
}

const MOCK_ADAPTER: LLMContract = {
  async generate(): Promise<string> {
    return "Mock response";
  },
};

export function createLLM(service: LService, model: LModel): LLMContract {
  validateServiceModel(service, model);

  if (service === LService.MOCK) return MOCK_ADAPTER;

  const initModel = SDK_PROVIDERS[service];
  if (!initModel) {
    throw new Error(`No SDK provider registered for service "${service}"`);
  }

  return createSDKAdapter(initModel(model));
}