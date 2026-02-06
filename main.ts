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

const service = parseService(process.env.AI_SERVICE || process.env.AI_SPEC?.split(":")[0]);
const model = parseModel(process.env.AI_MODEL || process.env.AI_SPEC?.split(":")[1]);
const initialPrompt = process.env.INITIAL_PROMPT || "Write a very small program that prints a short confirmation message.";
const cmd = process.env.CMD ? (process.env.CMD.startsWith("[") ? JSON.parse(process.env.CMD) : process.env.CMD) : "echo OK";
// Use a specific env var for the requested code language to avoid using the
// system `LANG` (e.g. `en_US.UTF-8`) which is not a code language.
const lang = process.env.CODE_LANG || process.env.BOXSAFE_LANG || "bash";
const pathOutput = process.env.PATH_OUTPUT || "/dev/shm/boxsafe_output.txt";

// Call loop with constructed options
loop({ service, model, initialPrompt, cmd, lang, pathOutput }).catch((err) => {
	console.error("[loop] error:", err);
	process.exitCode = 1;
});
