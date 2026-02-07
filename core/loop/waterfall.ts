import { readFile } from "node:fs/promises";
import logger from "@/util/logger";

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
  score?: number;
  breakdown?: ScoreBreakdown;
}

export interface WaterfallSuccess {
  ok: true;
  score: number;
  breakdown: ScoreBreakdown;
}

export type WaterfallResult = WaterfallFail | WaterfallSuccess;

export interface ScoreBreakdown {
  exitCode: CheckResult;
  stderr: CheckResult;
  outputContract: CheckResult;
  artifacts: CheckResult;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface CheckResult {
  passed: boolean;
  points: number;
  maxPoints: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message?: string;
}

// Scoring system configuration
const SCORING_CONFIG = {
  PASSING_THRESHOLD: 70, // Minimum score to pass (0-100)
  
  WEIGHTS: {
    exitCode: 40,
    stderr: 20,
    outputContract: 30,
    artifacts: 10,
  },
  
  STDERR: {
    CRITICAL_PATTERNS: [
      /^fatal error/im,
      /^error:.*failed/im,
      /segmentation fault/i,
      /core dumped/i,
      /unhandled exception/i,
      /^traceback \(most recent call last\)/im,
    ],
    
    WARNING_PATTERNS: [
      /warning:/i,
      /deprecated/i,
      /error rate/i,
      /exception.*registered/i,
    ],
    
    WARNING_PENALTY: 50, // Penalty percentage for warnings
  },
  
  OUTPUT_CONTRACT: {
    PARTIAL_CREDIT: true,
    PARTIAL_THRESHOLD: 50, // Minimum percentage of contracts to earn partial credit
  },
};

/**
 * Executes cascading validations with scoring system.
 * Critical failures result in immediate rejection.
 * Minor failures are accumulated to calculate final score.
 */
export async function waterfall(
  ctx: WaterfallContext
): Promise<WaterfallResult> {
  logger.info('waterfall', 'Starting evaluation system');
  
  const breakdown: ScoreBreakdown = {
    exitCode: { passed: false, points: 0, maxPoints: 0, severity: 'critical' },
    stderr: { passed: false, points: 0, maxPoints: 0, severity: 'high' },
    outputContract: { passed: false, points: 0, maxPoints: 0, severity: 'high' },
    artifacts: { passed: false, points: 0, maxPoints: 0, severity: 'medium' },
    totalScore: 0,
    maxScore: 100,
    percentage: 0,
  };

  // Check exit code (critical - auto-fails if non-zero)
  breakdown.exitCode = checkExitCode(ctx);
  
  if (!breakdown.exitCode.passed && breakdown.exitCode.severity === 'critical') {
    logger.error('waterfall', 'FAILED: Non-zero exit code (critical)');
    return {
      ok: false,
      layer: 'exit-code',
      reason: breakdown.exitCode.message || 'Process exited with non-zero code',
      details: `exitCode=${ctx.exec.exitCode}`,
      score: 0,
      breakdown,
    };
  }

  // Check stderr (can be critical or partial)
  breakdown.stderr = checkStderr(ctx);
  
  if (!breakdown.stderr.passed && breakdown.stderr.severity === 'critical') {
    logger.error('waterfall', 'FAILED: Critical error in stderr');
    return {
      ok: false,
      layer: 'stderr',
      reason: breakdown.stderr.message || 'Critical error detected',
      details: ctx.exec.stderr.slice(0, 500),
      score: calculateTotalScore(breakdown),
      breakdown,
    };
  }

  // Check output contract (non-critical)
  breakdown.outputContract = await checkOutputContract(ctx);

  // Check artifacts (non-critical)
  breakdown.artifacts = await checkArtifacts(ctx);

  // Calculate final score
  breakdown.totalScore = calculateTotalScore(breakdown);
  breakdown.percentage = breakdown.totalScore;

  logger.info('waterfall', `Final Score: ${breakdown.totalScore.toFixed(1)}/100`);
  logScoreBreakdown(breakdown);

  if (breakdown.totalScore >= SCORING_CONFIG.PASSING_THRESHOLD) {
    logger.info('waterfall', `PASSED (score: ${breakdown.totalScore.toFixed(1)} >= ${SCORING_CONFIG.PASSING_THRESHOLD})`);
    return {
      ok: true,
      score: breakdown.totalScore,
      breakdown,
    };
  } else {
    logger.warn('waterfall', `FAILED (score: ${breakdown.totalScore.toFixed(1)} < ${SCORING_CONFIG.PASSING_THRESHOLD})`);
    return {
      ok: false,
      layer: 'score-threshold',
      reason: 'Insufficient score for approval',
      details: `Obtained: ${breakdown.totalScore.toFixed(1)}, Required: ${SCORING_CONFIG.PASSING_THRESHOLD}`,
      score: breakdown.totalScore,
      breakdown,
    };
  }
}

function checkExitCode(ctx: WaterfallContext): CheckResult {
  const maxPoints = SCORING_CONFIG.WEIGHTS.exitCode;
  
  if (ctx.exec.exitCode === 0) {
    return {
      passed: true,
      points: maxPoints,
      maxPoints,
      severity: 'critical',
      message: 'Exit code OK',
    };
  }

  return {
    passed: false,
    points: 0,
    maxPoints,
    severity: 'critical',
    message: `Process exited with code ${ctx.exec.exitCode}`,
  };
}

function checkStderr(ctx: WaterfallContext): CheckResult {
  const maxPoints = SCORING_CONFIG.WEIGHTS.stderr;
  const stderr = ctx.exec.stderr || '';

  // Check for critical patterns first
  for (const pattern of SCORING_CONFIG.STDERR.CRITICAL_PATTERNS) {
    if (pattern.test(stderr)) {
      logger.error('waterfall', `Critical error detected: ${pattern}`);
      return {
        passed: false,
        points: 0,
        maxPoints,
        severity: 'critical',
        message: `Critical error pattern matched: ${pattern}`,
      };
    }
  }

  // Check for warnings (non-critical, but deduct points)
  let warningCount = 0;
  for (const pattern of SCORING_CONFIG.STDERR.WARNING_PATTERNS) {
    if (pattern.test(stderr)) {
      warningCount++;
    }
  }

  if (warningCount > 0) {
    const penalty = SCORING_CONFIG.STDERR.WARNING_PENALTY / 100;
    const points = maxPoints * (1 - penalty);
    logger.warn('waterfall', `${warningCount} warning(s) in stderr - ${SCORING_CONFIG.STDERR.WARNING_PENALTY}% penalty`);
    return {
      passed: true,
      points,
      maxPoints,
      severity: 'medium',
      message: `${warningCount} warning(s) detected`,
    };
  }

  return {
    passed: true,
    points: maxPoints,
    maxPoints,
    severity: 'high',
    message: 'No critical errors in stderr',
  };
}

async function checkOutputContract(ctx: WaterfallContext): Promise<CheckResult> {
  const maxPoints = SCORING_CONFIG.WEIGHTS.outputContract;
  const raw = process.env.SUCCESS_CONTRACTS ?? '__RESULT__=SUCCESS';
  const contracts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const stdout = ctx.exec.stdout ?? '';

  let matchedContracts = 0;

  // Try JSON parse
  try {
    const parsed = JSON.parse(stdout);
    if (parsed && (parsed.result === 'success' || parsed.status === 'success')) {
      logger.info('waterfall', '✓ JSON contract detected in stdout');
      return {
        passed: true,
        points: maxPoints,
        maxPoints,
        severity: 'high',
        message: 'JSON success contract matched',
      };
    }
  } catch {
    // Not JSON, continue
  }

  // Check string/regex contracts in stdout
  for (const contract of contracts) {
    if (!contract) continue;
    
    const matched = contract.startsWith('/') && contract.endsWith('/')
      ? new RegExp(contract.slice(1, -1)).test(stdout)
      : stdout.includes(contract);

    if (matched) {
      matchedContracts++;
      logger.info('waterfall', `✓ Contract matched: ${contract}`);
    }
  }

  // Check artifact if no matches in stdout
  if (ctx.artifacts?.outputFile && matchedContracts === 0) {
    try {
      const content = await readFile(ctx.artifacts.outputFile, 'utf-8');
      for (const contract of contracts) {
        if (!contract) continue;
        
        const matched = contract.startsWith('/') && contract.endsWith('/')
          ? new RegExp(contract.slice(1, -1)).test(content)
          : content.includes(contract);

        if (matched) {
          matchedContracts++;
          logger.info('waterfall', `✓ Contract matched in artifact: ${contract}`);
        }
      }
    } catch (err: any) {
      logger.warn('waterfall', 'Could not read artifact:', err?.message);
    }
  }

  // Calculate score based on matched contracts
  const percentage = contracts.length > 0 ? matchedContracts / contracts.length : 0;
  
  if (matchedContracts === contracts.length) {
    return {
      passed: true,
      points: maxPoints,
      maxPoints,
      severity: 'high',
      message: `All ${contracts.length} contract(s) matched`,
    };
  } else if (
    SCORING_CONFIG.OUTPUT_CONTRACT.PARTIAL_CREDIT &&
    percentage >= SCORING_CONFIG.OUTPUT_CONTRACT.PARTIAL_THRESHOLD / 100
  ) {
    const points = maxPoints * percentage;
    logger.warn('waterfall', `Only ${matchedContracts}/${contracts.length} contracts matched`);
    return {
      passed: true,
      points,
      maxPoints,
      severity: 'medium',
      message: `Partial match: ${matchedContracts}/${contracts.length} contracts`,
    };
  } else {
    logger.warn('waterfall', `Insufficient contracts: ${matchedContracts}/${contracts.length}`);
    return {
      passed: false,
      points: 0,
      maxPoints,
      severity: 'high',
      message: `Insufficient contracts: ${matchedContracts}/${contracts.length}`,
    };
  }
}

async function checkArtifacts(ctx: WaterfallContext): Promise<CheckResult> {
  const maxPoints = SCORING_CONFIG.WEIGHTS.artifacts;

  if (!ctx.artifacts?.outputFile) {
    return {
      passed: true,
      points: maxPoints,
      maxPoints,
      severity: 'low',
      message: 'No artifact required',
    };
  }

  try {
    const content = await readFile(ctx.artifacts.outputFile, 'utf-8');

    if (!content || content.trim().length === 0) {
      logger.warn('waterfall', 'Empty artifact');
      return {
        passed: false,
        points: 0,
        maxPoints,
        severity: 'medium',
        message: 'Output artifact is empty',
      };
    }

    logger.info('waterfall', `✓ Artifact OK (${content.length} bytes)`);
    return {
      passed: true,
      points: maxPoints,
      maxPoints,
      severity: 'low',
      message: 'Artifact valid',
    };
  } catch (err: any) {
    logger.warn('waterfall', 'Error reading artifact:', err.message);
    return {
      passed: false,
      points: 0,
      maxPoints,
      severity: 'medium',
      message: `Failed to read artifact: ${err.message}`,
    };
  }
}

function calculateTotalScore(breakdown: ScoreBreakdown): number {
  return (
    breakdown.exitCode.points +
    breakdown.stderr.points +
    breakdown.outputContract.points +
    breakdown.artifacts.points
  );
}

function logScoreBreakdown(breakdown: ScoreBreakdown): void {
  logger.info('waterfall', '  Score breakdown:');
  logger.info('waterfall', `  Exit Code:       ${breakdown.exitCode.points.toFixed(1)}/${breakdown.exitCode.maxPoints} ${breakdown.exitCode.passed ? '✓' : '✗'}`);
  logger.info('waterfall', `  Stderr:          ${breakdown.stderr.points.toFixed(1)}/${breakdown.stderr.maxPoints} ${breakdown.stderr.passed ? '✓' : '✗'}`);
  logger.info('waterfall', `  Output Contract: ${breakdown.outputContract.points.toFixed(1)}/${breakdown.outputContract.maxPoints} ${breakdown.outputContract.passed ? '✓' : '✗'}`);
  logger.info('waterfall', `  Artifacts:       ${breakdown.artifacts.points.toFixed(1)}/${breakdown.artifacts.maxPoints} ${breakdown.artifacts.passed ? '✓' : '✗'}`);
  logger.info('waterfall', `  ────────────────────────────`);
  logger.info('waterfall', `  TOTAL:           ${breakdown.totalScore.toFixed(1)}/100`);
}