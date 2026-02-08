/**
 * @fileoverview Service and model identifiers with compatibility constraints.
 * @module pack/ai
 */

export enum LService {
  MOCK = "mock",
  OPENAI = "openai",
  GOOGLE = "google",
}

export enum LModel {
  MOCK = "mock",
  GPT = "gpt-4o-mini",
  GEMINI = "gemini-2.5-flash",
}

/* Valid model options per service */
export const SERVICE_MODELS: Record<LService, LModel[]> = {
  [LService.MOCK]: [LModel.MOCK],
  [LService.OPENAI]: [LModel.GPT],
  [LService.GOOGLE]: [LModel.GEMINI],
};

export function validateServiceModel(service: LService, model: LModel): void {
  const allowed = SERVICE_MODELS[service];
  if (!allowed.includes(model)) {
    throw new Error(
      `Model "${model}" is not supported by service "${service}". ` +
      `Allowed: ${allowed.join(", ")}`
    );
  }
}