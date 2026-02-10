/**
 * Segmentation map initialization
 *
 * Encapsulates all route logic in a single function.
 * No arguments required—all config comes from boxsafe.config.json and env.
 */
import { ANSI } from "@/util/ANSI";
import { loadBoxSafeConfig } from '@core/config/loadConfig';

/**
 * Initialize segments map with all available routes.
 * Loads config from boxsafe.config.json and env variables.
 * Returns { routes, runSegment } for use in the application.
 */
export async function initSegments() {
  const { config: BSConfig } = loadBoxSafeConfig();
  const routes: Record<string, any> = {
    loop: {
      handler: async (opts?: any) => {
        const mod = await import("@core/loop/execLoop");
        return mod.loop(opts);
      },
      meta: {
        description: "Iterative LLM -> code -> exec loop",
        implemented: true,
        config: {
          defaultLang: "ts",
          pathOutput: process.env.AGENT_OUTPUT_PATH ?? "./out.ts",
        },
      },
    },
    navigate: {
      handler: async (params?: any) => {
        const mod = await import("@core/navigate");
        const workspace = BSConfig.project?.workspace ?? "./";
        const handler = mod.createNavigatorHandler(workspace);
        return handler.execute(params);
      },
      meta: {
        description: "File system navigation with workspace boundary enforcement",
        implemented: true,
        config: {
          workspace: BSConfig.project?.workspace ?? "./",
          maxFileSize: 10 * 1024 * 1024,
        },
      },
    },
    sandbox: null, // create
    model: {
      primary: BSConfig.model?.primary ?? null,
      fallback: BSConfig.model?.fallback ?? null,
      endpoint: BSConfig.model?.endpoint ?? null,
    },
    commands: {
      setup: BSConfig.commands?.setup ?? null,
      run: BSConfig.commands?.run ?? null,
      test: BSConfig.commands?.test ?? null,
    },
    interface: {
      channel: BSConfig.interface?.channel ?? null,
      prompt: BSConfig.interface?.prompt ?? null,
      notifications: BSConfig.interface?.notifications ?? null,
    },
    teach: {
      urls: BSConfig.teach?.urls ?? null,
      files: BSConfig.teach?.files ?? null,
    },
    versionControl: {
      handler: async (params?: any) => {
        const mod = await import('@core/loop/git');
        return mod.runVersionControl(params ?? {});
      },
      meta: {
        description: 'Versioning helper: commit, notes and optional push to origin',
        implemented: true,
        config: {
          autoPushDefault: BSConfig.project?.versionControl?.after ?? false,
          createNotesDefault: BSConfig.project?.versionControl?.generateNotes ?? false,
        },
      },
    },
  };

  type RouteName = keyof typeof routes;

  const runSegment = async (name: RouteName, args?: any) => {
    const node = routes[name];
    const handler = node?.handler ?? node?.run ?? null;
    if (typeof handler === "function") return handler(args);
    throw new Error(`Segment '${String(name)}' not implemented`);
  };

  return { routes, runSegment, BSConfig };
}