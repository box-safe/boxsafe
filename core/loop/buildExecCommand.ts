import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '@core/util/logger';
import { ANSI } from '@util/ANSI';

type AnsiLike = { Cyan: string; Yellow: string; Reset: string };

type BuildExecCommandArgs = {
  cmd: any;
  lang: string;
  pathOutput: string;
};

const logger = Logger.createModuleLogger('BuildExecCommand');

export async function buildExecCommand({ cmd, lang, pathOutput }: BuildExecCommandArgs): Promise<any> {
  // If caller left the default `echo OK`, automatically run the
  // generated output file according to the requested language so the
  // loop actually executes the produced artifact.
  let execCmd = cmd;
  if (typeof cmd === 'string' && cmd === 'echo OK') {
    if (lang === 'ts') execCmd = ['tsx', [pathOutput]];
    else if (lang === 'js') execCmd = ['node', [pathOutput]];
    else if (lang === 'py' || lang === 'python') execCmd = ['python', [pathOutput]];
    else if (lang === 'sh' || lang === 'bash' || lang === 'shell') execCmd = ['bash', [pathOutput]];
    else execCmd = `${pathOutput}`;

    const display = typeof execCmd === 'string' ? execCmd : Array.isArray(execCmd) ? `${execCmd[0]} ${execCmd[1].join(' ')}` : String(execCmd);
    logger.info(`auto-executing generated file with: ${display}`);
  }

  // If executing JS: check for CommonJS usage (require) and project type=module.
  try {
    const isNodeExec =
      lang === 'js' &&
      ((typeof execCmd === 'string' && execCmd.trimStart().startsWith('node ')) ||
        (Array.isArray(execCmd) && String(execCmd[0]) === 'node'));

    if (isNodeExec) {
      const pkgPath = path.join(process.cwd(), 'package.json');
      let isModuleType = false;
      try {
        if (fs.existsSync(pkgPath)) {
          const pkgRaw = fs.readFileSync(pkgPath, 'utf-8');
          const pkg = JSON.parse(pkgRaw);
          isModuleType = pkg.type === 'module';
        }
      } catch {
        isModuleType = false;
      }

      const outContent = fs.readFileSync(pathOutput, 'utf-8');
      if (isModuleType && /\brequire\s*\(/.test(outContent) && path.extname(pathOutput) === '.js') {
        const newPath = pathOutput.replace(/\.js$/, '.cjs');
        try {
          await fs.promises.rename(pathOutput, newPath);
          execCmd = ['node', [newPath]];
          logger.info(`renamed output to ${newPath} for CommonJS compatibility`);
          // create a minimal ESM wrapper at the original path so artifact exists
          try {
            const wrapper = `import { spawnSync } from 'node:child_process';\nimport path from 'node:path';\nconst target = path.join(path.dirname(new URL(import.meta.url).pathname), '${path.basename(newPath)}');\nconst res = spawnSync('node', [target], { stdio: 'inherit' });\nif (res.error) throw res.error;\nprocess.exit(res.status ?? 0);\n`;
            await fs.promises.writeFile(pathOutput, wrapper, 'utf-8');
          } catch {
            // ignore
          }
        } catch {
          logger.warn(`failed to rename file`);
        }
      }
    }
  } catch {
    // non-fatal
  }

  return execCmd;
}
