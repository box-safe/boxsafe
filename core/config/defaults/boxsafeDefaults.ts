import type { BoxSafeConfig } from '@/types';

export const DEFAULT_BOXSAFE_CONFIG: BoxSafeConfig = {
  project: {
    workspace: './',
    testDir: './',
    versionControl: {
      before: false,
      after: false,
      generateNotes: false,
    },
  },
  model: {
    primary: {
      provider: 'google',
      name: 'gemini-2.5-flash',
    },
    fallback: [],
    endpoint: null,
    parameters: {},
  },
  smartRotation: {
    enabled: false,
    simple: [],
    complex: [],
  },
  limits: {
    tokens: 100000,
    loops: 2,
    timeout: {
      enabled: false,
      duration: '1h',
      notify: true,
    },
  },
  sandbox: {
    enabled: true,
    engine: 'docker',
    memory: '512m',
    cpu: 0.5,
    network: 'none',
  },
  commands: {
    setup: 'npm install',
    run: 'echo OK',
    test: null,
    timeoutMs: 60_000,
  },
  interface: {
    channel: 'terminal',
    prompt: '',
    notifications: {
      whatsapp: false,
      telegram: false,
      slack: false,
      email: false,
    },
  },
  paths: {
    generatedMarkdown: './memo/generated/codelog.md',
    artifactOutput: './out.ts',
  },
  teach: {
    urls: [],
    files: [],
  },
};
