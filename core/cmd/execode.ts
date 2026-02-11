import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import type { CommandRun } from "@/types";
import type { ExecResult } from "@core/loop/waterfall";
import { STATES_LOGS_DIR, STATES_LOG_FILE } from "@core/paths/paths";

type ExecodeOptions = {
  timeoutMs?: number;
  allowUnsafeShell?: boolean;
};

const DEFAULT_MAX_RUNTIME_MS = 60_000;

function getEffectiveTimeoutMs(timeoutMs?: number): number {
  const fromEnv = process.env.BOXSAFE_CMD_TIMEOUT_MS ? Number(process.env.BOXSAFE_CMD_TIMEOUT_MS) : NaN;
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  if (typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0) return timeoutMs;
  return DEFAULT_MAX_RUNTIME_MS;
}

function containsShellOperators(s: string): boolean {
  return /[;&|`]|\$\(|\$\{|>>?|<\(|<|\n|\r/.test(s);
}

function isObviouslyDangerousCommand(s: string): boolean {
  const x = s.toLowerCase();
  return (
    /\brm\s+-rf\b/.test(x) ||
    /\bmkfs\b/.test(x) ||
    /\bdd\b\s+if=/.test(x) ||
    /\bshutdown\b/.test(x) ||
    /\breboot\b/.test(x)
  );
}

function shouldAllowUnsafeShell(options?: ExecodeOptions): boolean {
  const fromEnv = process.env.BOXSAFE_ALLOW_UNSAFE_SHELL?.toLowerCase();
  if (fromEnv === 'true' || fromEnv === '1' || fromEnv === 'yes') return true;
  return Boolean(options?.allowUnsafeShell);
}

export async function execode(
  command: CommandRun,
  options?: ExecodeOptions
): Promise<ExecResult> {
  const maxRuntimeMs = getEffectiveTimeoutMs(options?.timeoutMs);
  const normalized = normalizeCommand(command);
  const { cmd, args, useShell } = normalized;

  if (useShell) {
    const allowUnsafe = shouldAllowUnsafeShell(options);
    if (!allowUnsafe) {
      if (containsShellOperators(cmd) || isObviouslyDangerousCommand(cmd)) {
        const stderr = `Blocked potentially unsafe shell command: ${cmd}`;
        await mkdir(STATES_LOGS_DIR, { recursive: true });
        await writeFile(STATES_LOG_FILE, stderr, "utf8");
        return { exitCode: 126, stdout: "", stderr };
      }
    }
  }

  await mkdir(STATES_LOGS_DIR, { recursive: true });

  return new Promise<ExecResult>((resolve, reject) => {
    const child = spawn(cmd, args, { shell: useShell });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, maxRuntimeMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", async (code, signal) => {
      clearTimeout(timer);

      const log = [
        `exitCode=${code ?? 0}`,
        `signal=${signal ?? "none"}`,
        `timedOut=${timedOut}`,
        `stdout:`, stdout,
        `stderr:`, stderr,
      ].join("\n");

      await writeFile(STATES_LOG_FILE, log, "utf8");

      resolve({
        exitCode: code ?? 0,
        stdout,
        stderr,
      });
    });
  });
}

function normalizeCommand(
  command: CommandRun
): { cmd: string; args: string[]; useShell: boolean } {
  if (typeof command === "string") {
    return { cmd: command, args: [], useShell: true };
  }

  const [cmd, args] = command;
  return { cmd, args, useShell: false };
}

