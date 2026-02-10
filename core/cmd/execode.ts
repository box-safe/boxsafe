import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CommandRun } from "@/types";
import type { ExecResult } from "@core/loop/waterfall";

const LOG_DIR = path.join(process.cwd(), "memo", "states-logs");
const LOG_FILE = path.join(LOG_DIR, "logs.txt");
const MAX_RUNTIME_MS = 60_000;

export async function execode(
  command: CommandRun
): Promise<ExecResult> {
  const { cmd, args } = normalizeCommand(command);

  await mkdir(LOG_DIR, { recursive: true });

  return new Promise<ExecResult>((resolve, reject) => {
    const child = spawn(cmd, args, { shell: true });

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
    }, MAX_RUNTIME_MS);

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

      await writeFile(LOG_FILE, log, "utf8");

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
): { cmd: string; args: string[] } {
  if (typeof command === "string") {
    return { cmd: command, args: [] };
  }

  const [cmd, args] = command;
  return { cmd, args };
}

