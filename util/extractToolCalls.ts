import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { Logger } from '@core/util/logger';
import type { ToolCallParseResult, ToolCallParseError } from '@core/loop/toolCalls';
import { parseOneToolCall, isParseError } from '@core/loop/toolCalls';

const logger = Logger.createModuleLogger('ExtractToolCalls');

/**
 * Extracts json-tool blocks from Markdown using remark (same approach as extractCode)
 * 
 * @param md - Markdown string (usually LLM response)
 * @returns ToolCallParseResult with parsed calls and errors
 */
export const extractToolCalls = async (md: string): Promise<ToolCallParseResult> => {
  const calls: any[] = [];
  const errors: ToolCallParseError[] = [];

  if (!md || typeof md !== 'string') {
    const errorMsg = 'Invalid markdown input: expected non-empty string';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.debug(`Processing markdown of length ${md.length}`);

  const onVisitCode = (node: any) => {
    if (!node?.value) return;
    
    // Only process json-tool blocks
    if (node.lang === 'json-tool') {
      logger.debug(`Found json-tool block: ${node.value.substring(0, 100)}...`);
      
      try {
        const jsonContent = node.value.trim();
        const parsed = JSON.parse(jsonContent);
        const toolCall = parseOneToolCall(parsed);
        
        if (isParseError(toolCall)) {
          logger.warn(`Invalid tool call: ${toolCall.error}`);
          errors.push({ ...toolCall, fence: jsonContent });
        } else {
          logger.info(`Valid tool call detected: ${toolCall.tool}`);
          calls.push(toolCall);
        }
      } catch (e: any) {
        logger.error(`JSON parse error: ${e?.message ?? String(e)}`);
        errors.push({ 
          ok: false, 
          error: `invalid JSON: ${e?.message ?? String(e)}`, 
          fence: node.value 
        });
      }
    }
  };

  try {
    await remark()
      .use(() => (tree) => {
        visit(tree, 'code', onVisitCode);
      })
      .process(md);

    logger.info(`Extracted ${calls.length} tool calls, ${errors.length} errors`);
    
    return { 
      ok: true, 
      calls, 
      errors 
    };
  } catch (error) {
    const errorMsg = `Failed to parse markdown for tool calls: ${error}`;
    logger.error(errorMsg);
    throw new Error(
      `Failed to extract tool calls: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    );
  }
};
