import { writeFile, rename } from 'node:fs/promises';

export async function writeArtifactAtomically(args: {
  tmpPath: string;
  pathOutput: string;
  content: string;
  signal?: AbortSignal;
}): Promise<void> {
  const { tmpPath, pathOutput, content, signal } = args;
  if (signal?.aborted) throw new Error('Aborted');
  await writeFile(tmpPath, content, 'utf-8');
  await rename(tmpPath, pathOutput);
}
