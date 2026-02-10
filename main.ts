/**
 * Main entry point for BoxSafe
 * 
 * Tests the segmentation system with the loop segment.
 */

import { initSegments } from "@core/sgmnt/map";
import logger from "@util/logger";
import type { LoopOptions } from "@core/loop/types";
import { LService, LModel } from "@ai/label";

async function main() {
  logger.info("main", "Starting BoxSafe (minimal main)...");

  try {
    // Initialize and obtain the segment runner and configuration
    const { runSegment, BSConfig } = await initSegments();

    // Build a minimal, typed options object for the loop segment.
    // Note: do not apply project-specific heuristics here — defer to the segment.
    const loops = BSConfig.limits?.loops;
    const opts: LoopOptions = {
      service: (BSConfig.model?.primary?.provider ?? LService.GOOGLE) as LService,
      model: (BSConfig.model?.primary?.name ?? LModel.GEMINI) as LModel,
      initialPrompt: BSConfig.interface?.prompt ?? "",
      cmd: BSConfig.commands?.run ?? "echo OK",
      lang: "ts",
      pathOutput: process.env.AGENT_OUTPUT_PATH ?? "./out.ts",
      workspace: BSConfig.project?.workspace ?? process.cwd(),
      ...(loops ? { maxIterations: loops, limit: loops } : {}),
    };

    logger.info("main", `Running loop segment`);

    // Delegate execution to the segment runner (keep main minimal)
    const result = await runSegment("loop", opts);

    logger.info("main", `Loop completed: ${JSON.stringify(result)}`);
    process.exit(result?.ok ? 0 : 1);
  } catch (err: any) {
    logger.error("main", `Fatal error: ${err?.message ?? err}`);
    process.exit(1);
  }
}

main();
