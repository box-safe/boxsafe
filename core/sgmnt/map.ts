/**
 * Segmentation map initialization
 *
 * Encapsulates all route logic in a single function.
 * No arguments required—all config comes from BS.config.json and env.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Initialize segments map with all available routes.
 * Loads config from BS.config.json and env variables.
 * Returns { routes, runSegment } for use in the application.
 */
export async function initSegments() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const CONFIG_PATH = path.resolve(__dirname, "../../BS.config.json");
  let BSConfig: any = {};
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    BSConfig = JSON.parse(raw);
  } catch (err) {
    BSConfig = {};
  }

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
          pathOutput: process.env.AGENT_OUTPUT_PATH ?? "./out.js",
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
      primary: BSConfig.model?.primary ?? null, // create
      fallback: BSConfig.model?.fallback ?? null, // create
      endpoint: BSConfig.model?.endpoint ?? null, // create
    },

    commands: {
      setup: BSConfig.commands?.setup ?? null, // create
      run: BSConfig.commands?.run ?? null,
      test: BSConfig.commands?.test ?? null, // create
    },

    interface: {
      channel: BSConfig.interface?.channel ?? null,
      prompt: BSConfig.interface?.prompt ?? null, // create
      notifications: BSConfig.interface?.notifications ?? null, // create
    },

    teach: {
      urls: BSConfig.teach?.urls ?? null, // create
      files: BSConfig.teach?.files ?? null, // create
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
