/**
 * @fileoverview Unified LLM runner. Executes a prompt and persists the result.
 * @module pack
 * The code needs to run in the root directory to work
 * this ensures it's called in the main method at the project root.
 */

import "dotenv/config";
import * as path from "path";
import fs from "fs/promises"
import { createLLM } from "@pack/ai/provider";
import { LService, LModel } from "@pack/ai/label";

interface RunnerConfig {
  service: LService;
  model: LModel;
  outputPath: string;
}

const DEFAULT_CONFIG: RunnerConfig = {
  service: LService.GOOGLE,
  model: LModel.GEMINI,
  outputPath: "codelog.txt",
};

const writeOutput = async (filePath: string, data: string): Promise<void> => {
  const root = process.cwd();
  const resolved = path.join(root, "memo", "receivercodes", filePath);
  await fs.writeFile(resolved, data, "utf8");
};

export const run = async (
  prompt: string,
  llm: ReturnType<typeof createLLM>,
  config: RunnerConfig = DEFAULT_CONFIG,

): Promise<void> => {
  const text = await llm.generate(prompt);
  await writeOutput(config.outputPath, text);
};


// ── entry point ──────────────────────────────────────────────────────────────
