/**
 * Main entry point for BoxSafe
 * 
 * Tests the segmentation system with the loop segment.
 */

import { initSegments } from "@core/sgmnt/map";
import logger from "@util/logger";

// Minimal typed options for the loop segment
type LoopOptions = {
  service?: string;
  model?: string;
  initialPrompt?: string;
  cmd?: string;
  lang?: string;
  pathOutput?: string;
  workspace?: string;
  maxIterations?: number;
  limit?: number;
  [key: string]: any;
};

async function main() {
  logger.info("main", "Starting BoxSafe (minimal main)...");

  try {
    // Initialize and obtain the segment runner and configuration
    const { runSegment, BSConfig } = await initSegments();

    // Build a minimal, typed options object for the loop segment.
    // Note: do not apply project-specific heuristics here — defer to the segment.
    const opts: LoopOptions = {
      service: BSConfig.model?.primary?.provider,
      model: BSConfig.model?.primary?.name,
      initialPrompt: BSConfig.interface?.prompt ?? undefined,
      cmd: BSConfig.commands.run ?? undefined,
      lang: "ts", // Default language for the loop segment
      pathOutput: process.env.AGENT_OUTPUT_PATH ?? "./out.ts",
      workspace: BSConfig.project?.workspace ?? process.cwd(),
      maxIterations: BSConfig.limits?.loops,
      limit: BSConfig.limits?.loops,
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
