/**
 * Main entry point for BoxSafe
 * 
 * Tests the segmentation system with the loop segment.
 */

import { initSegments } from "@core/segments/map";
import { Logger } from "@util/logger";
import type { LoopOptions } from "@core/loop/types";
import { LService, LModel } from "@ai/label";

const logger = Logger.createModuleLogger('Main');

async function main() {
  logger.info(`Starting BoxSafe (minimal main)...`);

  try {
    // Initialize and obtain the segment runner and configuration
    const { runSegment, BSConfig } = await initSegments();

    // Build a minimal, typed options object for the loop segment.
    // Note: do not apply project-specific heuristics here — defer to the segment.
    const loops = BSConfig.limits?.loops;

    const pathOutput = process.env.AGENT_OUTPUT_PATH ?? BSConfig.paths?.artifactOutput ?? "./out.ts";
    const pathGeneratedMarkdown = process.env.BOXSAFE_MARKDOWN_PATH ?? BSConfig.paths?.generatedMarkdown ?? "./memo/generated/codelog.md";
    const promptFromEnv = typeof process.env.BOXSAFE_PROMPT === 'string' ? process.env.BOXSAFE_PROMPT : undefined;
    const opts: LoopOptions = {
      service: (BSConfig.model?.primary?.provider ?? LService.GOOGLE) as LService,
      model: (BSConfig.model?.primary?.name ?? LModel.GEMINI) as LModel,
      initialPrompt: promptFromEnv ?? BSConfig.interface?.prompt ?? "",
      cmd: BSConfig.commands?.run ?? "echo OK",
      lang: "ts",
      pathOutput,
      pathGeneratedMarkdown,
      workspace: BSConfig.project?.workspace ?? process.cwd(),
      ...(loops ? { maxIterations: loops, limit: loops } : {}),
    };

    logger.info(`Running loop segment`);

    // Delegate execution to the segment runner (keep main minimal)
    const result = await runSegment("loop", opts);

    logger.info(`Loop completed: ${JSON.stringify(result)}`);
    process.exit(result?.ok ? 0 : 1);
  } catch (err: any) {
    logger.error(`Fatal error: ${err?.message ?? err}`);
    process.exit(1);
  }
}

main();
