import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('ToolCalls');

export type ToolName = 'navigate' | 'versionControl';

export type NavigateOp = 'list' | 'read' | 'write' | 'mkdir' | 'delete' | 'stat';

export type NavigateToolCall = {
  tool: 'navigate';
  params: {
    op: NavigateOp;
    path?: string;
    content?: string;
    writeOptions?: { append?: boolean; createDirs?: boolean };
    mkdirOptions?: { recursive?: boolean };
    deleteOptions?: { recursive?: boolean };
  };
};

export type VersionControlToolCall = {
  tool: 'versionControl';
  params: Record<string, unknown>;
};

export type ToolCall = NavigateToolCall | VersionControlToolCall;

export type ToolCallParseError = {
  ok: false;
  error: string;
  fence?: string;
};

export type ToolCallParseResult = {
  ok: true;
  calls: ToolCall[];
  errors: ToolCallParseError[];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function isParseError(v: ToolCall | ToolCallParseError): v is ToolCallParseError {
  return isPlainObject(v) && (v as any).ok === false;
}

function isNavigateOp(v: unknown): v is NavigateOp {
  return (
    v === 'list' ||
    v === 'read' ||
    v === 'write' ||
    v === 'mkdir' ||
    v === 'delete' ||
    v === 'stat'
  );
}

function parseOneToolCall(obj: unknown): ToolCall | ToolCallParseError {
  if (!isPlainObject(obj)) return { ok: false, error: 'tool call must be an object' };

  const tool = obj.tool;
  if (tool !== 'navigate' && tool !== 'versionControl') {
    return { ok: false, error: `unknown tool: ${String(tool)}` };
  }

  const paramsRaw = obj.params;
  const params = isPlainObject(paramsRaw) ? paramsRaw : {};

  if (tool === 'navigate') {
    const op = params.op;
    if (!isNavigateOp(op)) {
      return { ok: false, error: `navigate.op must be one of list|read|write|mkdir|delete|stat (got: ${String(op)})` };
    }

    const path = typeof params.path === 'string' ? params.path : undefined;
    const content = typeof params.content === 'string' ? params.content : undefined;

    if ((op === 'read' || op === 'write' || op === 'mkdir' || op === 'delete' || op === 'stat') && !path) {
      return { ok: false, error: `navigate.op=${op} requires params.path` };
    }

    if (op === 'write' && content === undefined) {
      return { ok: false, error: `navigate.op=write requires params.content` };
    }

    const writeOptions = isPlainObject(params.writeOptions) ? params.writeOptions : undefined;
    const mkdirOptions = isPlainObject(params.mkdirOptions) ? params.mkdirOptions : undefined;
    const deleteOptions = isPlainObject(params.deleteOptions) ? params.deleteOptions : undefined;

    return {
      tool: 'navigate',
      params: {
        op,
        ...(path ? { path } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(writeOptions
          ? {
              writeOptions: {
                ...(typeof writeOptions.append === 'boolean' ? { append: writeOptions.append } : {}),
                ...(typeof writeOptions.createDirs === 'boolean' ? { createDirs: writeOptions.createDirs } : {}),
              },
            }
          : {}),
        ...(mkdirOptions
          ? {
              mkdirOptions: {
                ...(typeof mkdirOptions.recursive === 'boolean' ? { recursive: mkdirOptions.recursive } : {}),
              },
            }
          : {}),
        ...(deleteOptions
          ? {
              deleteOptions: {
                ...(typeof deleteOptions.recursive === 'boolean' ? { recursive: deleteOptions.recursive } : {}),
              },
            }
          : {}),
      },
    };
  }

  return {
    tool: 'versionControl',
    params,
  };
}

export function parseToolCallsFromMarkdown(markdown: string): ToolCallParseResult {
  const calls: ToolCall[] = [];
  const errors: ToolCallParseError[] = [];

  logger.debug(`Parsing markdown for tool calls (${markdown.length} chars)`);

  // FIXED: Changed regex to specifically target json-tool blocks
  // The old regex /```(?:json|json-tool)\s*([\s\S]*?)\s*```/g was capturing the wrong group
  const jsonFenceRe = /```json-tool\s*([\s\S]*?)\s*```/g;
  let m: RegExpExecArray | null;

  while ((m = jsonFenceRe.exec(markdown)) !== null) {
    const fence = (m[1] ?? '').trim();
    logger.debug(`Found potential tool call: ${fence.substring(0, 100)}...`);
    
    if (!fence.startsWith('{')) {
      logger.debug('Skipping - does not start with {');
      continue;
    }

    try {
      const obj = JSON.parse(fence);
      logger.debug(`JSON parsed successfully: ${JSON.stringify(obj)}`);
      
      const parsed = parseOneToolCall(obj);
      
      if (isParseError(parsed)) {
        logger.warn(`Invalid tool call: ${parsed.error}`);
        errors.push({ ...parsed, fence });
      } else {
        logger.info(`Valid tool call detected: ${parsed.tool}`);
        calls.push(parsed);
      }
    } catch (e: any) {
      logger.error(`JSON parse failed: ${e?.message ?? String(e)}`);
      errors.push({ ok: false, error: `invalid JSON: ${e?.message ?? String(e)}`, fence });
    }
  }

  logger.info(`Tool calls parsed: ${calls.length} valid, ${errors.length} errors`);
  return { ok: true, calls, errors };
}

// Export helper functions for reuse
export { parseOneToolCall, isParseError };
