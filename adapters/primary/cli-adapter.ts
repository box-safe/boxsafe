/**
 * @fileoverview
 * Primary Adapters - Implement ports for primary actors
 * 
 * Connect Primary Actors (CLI, Web, IDE) with system core
 * 
 * @module adapters/primary/index
 */

import type { ISystemExecutionPort } from '@core/ports';
import { initSegments } from '@core/segments/map';

/**
 * CLI Adapter - implements ISystemExecutionPort for command line interface
 */
export class CLIAdapter implements ISystemExecutionPort {
  private segments: any;

  constructor() {
    this.init();
  }

  private async init() {
    const { runSegment, BSConfig } = await initSegments();
    this.segments = { runSegment, BSConfig };
  }

  /**
   * Execute a specific system segment
   */
  async executeSegment(segmentName: string, args?: any): Promise<any> {
    if (!this.segments?.runSegment) {
      throw new Error('Segments not initialized');
    }
    return this.segments.runSegment(segmentName, args);
  }

  /**
   * List all available segments
   */
  listSegments(): Record<string, any> {
    // TODO: Implement segment listing
    return {
      loop: { description: 'Iterative LLM -> code -> exec loop', implemented: true },
      navigate: { description: 'File system navigation with workspace boundary', implemented: true },
      versionControl: { description: 'Git version control operations', implemented: true }
    };
  }
}

/**
 * Factory function to create CLI adapter
 */
export function createCLIAdapter(): CLIAdapter {
  return new CLIAdapter();
}
