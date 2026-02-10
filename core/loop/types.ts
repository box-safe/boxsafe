import type { LModel, LService } from '@ai/label';
import type { CommandRun } from '@/types';
import type { Navigator } from '@core/navigate';

export type LoopLogger = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
};

export interface LoopOptions {
  service: LService;
  model: LModel;
  initialPrompt: string;
  cmd: CommandRun;
  lang: string;
  pathOutput: string;
  maxIterations?: number;
  limit?: number;
  signal?: AbortSignal;
  pathGeneratedMarkdown?: string;
  navigator?: Navigator;
  workspace?: string;
  logger?: LoopLogger;
}

export interface LoopResult {
  ok: boolean;
  iterations: number;
  verdict?: unknown;
  artifacts?: { outputFile?: string };
  navigator?: Navigator | null;
}
