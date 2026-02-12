/**
 * Segmentation map initialization
 *
 * Encapsulates all route logic in a single function.
 * No arguments required—all config comes from boxsafe.config.json and env.
 */
import { ANSI } from "../../util/ANSI";
import { loadBoxSafeConfig } from '@core/config/loadConfig';
import { createLoopSegment } from './loop';
import { createNavigateSegment } from './navigate';
import { createVersionControlSegment } from './versionControl';

/**
 * Initialize segments map with all available routes.
 * Loads config from boxsafe.config.json and env variables.
 * Returns { routes, runSegment } for use in the application.
 */
export async function initSegments() {
  const { config: BSConfig } = loadBoxSafeConfig();
  const routes: Record<string, any> = {
    loop: createLoopSegment(BSConfig),
    navigate: createNavigateSegment(BSConfig),
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
    versionControl: createVersionControlSegment(BSConfig),
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