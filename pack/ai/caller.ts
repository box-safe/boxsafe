/**
 * @fileoverview Unified LLM runner. Executes a prompt and persists the result.
 * @module pack
 */

import "dotenv/config";
import * as path from "path";
import { promises as fs } from "fs";
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
  outputPath: "output.txt",
};

async function writeOutput(filePath: string, data: string): Promise<void> {
  const resolved = path.resolve(filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, data, "utf-8");
}

async function run(prompt: string, config: RunnerConfig = DEFAULT_CONFIG): Promise<void> {
  const llm = createLLM(config.service, config.model);
  const text = await llm.generate(prompt);
  await writeOutput(config.outputPath, text);
}

// ── entry point ──────────────────────────────────────────────────────────────
run("Explain the fundamentals of event-driven software architecture.").catch(
  (err: Error) => {
    console.error("[LLM Runner]", err.message);
    process.exit(1);
  }
);