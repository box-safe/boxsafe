import { readFile } from "node:fs/promises";

export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface WaterfallContext {
  exec: ExecResult;
  artifacts?: {
    outputFile?: string;
  };
}

export interface WaterfallFail {
  ok: false;
  layer: string;
  reason: string;
  details?: string;
}

export interface WaterfallSuccess {
  ok: true;
}

export type WaterfallResult = WaterfallFail | WaterfallSuccess;

/**
 * Executes cascading validations.
 * Stops at the first error encountered.
 */
export async function waterfall(
  ctx: WaterfallContext
): Promise<WaterfallResult> {
  return (
    checkExitCode(ctx) ??
    checkCriticalStderr(ctx) ??
    (await checkOutputContract(ctx)) ??
    (await checkArtifacts(ctx)) ??
    success()
  );
}

function checkExitCode(ctx: WaterfallContext): WaterfallFail | null {
  if (ctx.exec.exitCode !== 0) {
    return {
      ok: false,
      layer: "exit-code",
      reason: "Process exited with non-zero code",
      details: `exitCode=${ctx.exec.exitCode}`,
    };
  }
  return null;
}

function checkCriticalStderr(ctx: WaterfallContext): WaterfallFail | null {
  const criticalPatterns = [/error:/i, /exception/i, /traceback/i];

  const hit = criticalPatterns.some((r) => r.test(ctx.exec.stderr));
  if (hit) {
    return {
      ok: false,
      layer: "stderr",
      reason: "Critical error detected in stderr",
      details: ctx.exec.stderr.slice(0, 500),
    };
  }

  return null;
}

async function checkOutputContract(
  ctx: WaterfallContext
): Promise<WaterfallFail | null> {
  // Example: explicit contract
  // __RESULT__=SUCCESS
  if (!ctx.exec.stdout.includes("__RESULT__=SUCCESS")) {
    return {
      ok: false,
      layer: "output-contract",
      reason: "Success contract not found in stdout",
      details: ctx.exec.stdout.slice(0, 500),
    };
  }

  return null;
}

async function checkArtifacts(
  ctx: WaterfallContext
): Promise<WaterfallFail | null> {
  if (!ctx.artifacts?.outputFile) return null;

  try {
    const content = await readFile(ctx.artifacts.outputFile, "utf-8");

    if (!content || content.trim().length === 0) {
      return {
        ok: false,
        layer: "artifact",
        reason: "Output file is empty",
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      layer: "artifact",
      reason: "Failed to read output artifact",
      details: err.message,
    };
  }

  return null;
}

/* ─────────────────────────────── */

function success(): WaterfallSuccess {
  return { ok: true };
}
