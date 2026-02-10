/**
 * Main entry point for BoxSafe
 * 
 * Tests the segmentation system with the loop segment.
 */

import { initSegments } from "@core/sgmnt/map";
import logger from "@util/logger";

async function main() {
  logger.info("main", "Starting BoxSafe...");

  try {
    // Initialize segments map and get run function
    const { runSegment, BSConfig } = await initSegments();
    logger.info("main", "Segments initialized");

    // Log loaded config for debugging
    logger.info("main", `Loaded config: model=${BSConfig.model?.primary?.name}, loops=${BSConfig.limits?.loops}`);
    logger.info("main", `Test prompt: ${BSConfig.interface?.prompt}`);

    // Prepare loop options from config
    // try to infer target filename from prompt (Portuguese "chamado <name>")
    // If a TODO is provided in config, prompt is not required — only infer when prompt exists
    const promptRaw = BSConfig.interface?.prompt;
    const promptText: string = promptRaw ? String(promptRaw).trim() : "";
    let inferredFilename = "./test-output.js";
    if (promptText) {
      try {
        const m = /chamado\s+([\w.\-/]+)/i.exec(promptText);
        if (m && m[1]) inferredFilename = m[1];
      } catch (e) {
        // fallback remains
      }
    }

    const loopOpts = {
      service: BSConfig.model?.primary?.provider,
      model: BSConfig.model?.primary?.name,
      initialPrompt: BSConfig.interface?.prompt ?? "",
      cmd: "echo OK",
      lang: "js",
      pathOutput: inferredFilename,
      workspace: BSConfig.project?.workspace ?? process.cwd(),
      maxIterations: BSConfig.limits?.loops || 2,
      limit: BSConfig.limits?.loops || 2,
    };

    logger.info("main", `Running loop segment with options: ${JSON.stringify(loopOpts, null, 2)}`);

    // Run the loop segment
    const result = await runSegment("loop", loopOpts);
    
    logger.info("main", `Loop completed: ${JSON.stringify(result, null, 2)}`);

    if (result?.ok) {
      logger.info("main", "✓ Test passed!");
      process.exit(0);
    } else {
      logger.error("main", "✗ Test failed!");
      process.exit(1);
    }
  } catch (err: any) {
    logger.error("main", `Fatal error: ${err?.message ?? err}`);
    process.exit(1);
  }
}

main();
