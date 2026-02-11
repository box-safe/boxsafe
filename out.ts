/**
 * Interprets a "prompt-system" markdown string, extracts the system prompt content,
 * and returns it as a clean string.
 *
 * This function follows a two-tiered approach to find and clean the system prompt:
 *
 * 1.  **Fenced Code Block Priority:** It first attempts to find the system prompt
 *     within a fenced code block explicitly marked with ````system```` or
 *     ````prompt-system```. Content within these blocks is treated as raw text
 *     and is cleaned by trimming each line and removing empty lines. This is the
 *     most robust method for clearly defined system prompts.
 *
 * 2.  **Heading Section Fallback:** If no such fenced code block is found, it
 *     then looks for a section introduced by a heading like `# System Prompt` or
 *     `## System Prompt`. All content following this heading, until another
 *     heading or a code block is encountered, is considered part of the system prompt.
 *     This content then undergoes a basic markdown cleanup process to remove common
 *     markdown syntax (e.g., bold/italic markers, link syntax, list markers).
 *
 * @param markdownInput The input markdown string potentially containing a system prompt.
 * @returns The cleaned system prompt as a string, or an empty string if no system prompt
 *          could be identified by either method.
 */
function extractSystemPrompt(markdownInput: string): string {
    const lines = markdownInput.split('\n');
    let inSystemBlock = false;
    const systemPromptLines: string[] = [];

    // --- Attempt 1: Extract from fenced code block (e.g., ```system) ---
    // Define common fence types for system prompts
    const systemBlockFences = ['```system', '```prompt-system'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if we are starting a system block
        const isStartFence = systemBlockFences.some(fence => line.startsWith(fence));
        if (isStartFence && !inSystemBlock) {
            inSystemBlock = true;
            continue; // Skip the fence line itself
        }

        // Check if we are ending a system block
        const isEndFence = line.startsWith('```') && inSystemBlock;
        if (isEndFence && inSystemBlock) {
            inSystemBlock = false;
            // Join collected lines, trim each, filter out purely empty ones, then trim the whole result.
            // This preserves internal line breaks but cleans up leading/trailing whitespace and blank lines.
            return systemPromptLines.map(l => l.trim()).filter(l => l.length > 0).join('\n').trim();
        }

        // If we are inside the block, collect the original line (to preserve internal spacing before final trim)
        if (inSystemBlock) {
            systemPromptLines.push(lines[i]);
        }
    }

    // --- Attempt 2: Extract from "System Prompt" heading section (if no fenced block was found) ---
    let inHeadingSection = false;
    // Define possible headings for a system prompt section
    const headingMarkers = ['# System Prompt', '## System Prompt'];
    const extractedSectionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if we've found the system prompt heading
        if (!inHeadingSection && headingMarkers.includes(line)) {
            inHeadingSection = true;
            continue; // Skip the heading line itself
        }

        if (inHeadingSection) {
            // Stop collecting if another heading (any level) or a code block starts
            // as these typically delineate the end of a section.
            if ((line.startsWith('#') && line.split(' ')[0].match(/^#+$/)) || line.startsWith('```')) {
                break;
            }
            extractedSectionLines.push(lines[i]); // Collect original line to preserve spacing before cleanup
        }
    }

    if (extractedSectionLines.length > 0) {
        let cleanedContent = extractedSectionLines.join('\n');

        // Apply basic markdown cleanup for content found in a heading section.
        // The order of replacements can be important for overlapping syntax.

        // Remove fenced code blocks (as a safeguard, though they should terminate the section)
        cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, '');
        // Remove inline code backticks (e.g., `code example`) -> code example
        cleanedContent = cleanedContent.replace(/`([^`]+)`/g, '$1');
        // Remove link syntax [text](url) -> text
        cleanedContent = cleanedContent.replace(/\[(.*?)\]\(.*?\)/g, '$1');
        // Remove image syntax ![alt text](url) -> alt text
        cleanedContent = cleanedContent.replace(/!\[(.*?)\]\(.*?\)/g, '$1');
        // Remove bold/italic markers (e.g., **bold**, *italic*, __bold__, _italic_)
        cleanedContent = cleanedContent.replace(/(\*\*|__)(.*?)\1/g, '$2'); // **bold** or __bold__
        cleanedContent = cleanedContent.replace(/(\*|_)(.*?)\1/g, '$2');     // *italic* or _italic_

        // Remove blockquote markers (e.g., > This is a quote) -> This is a quote
        cleanedContent = cleanedContent.replace(/^>\s*/gm, '');
        // Remove list item markers (e.g., - Item, * Item, 1. Item)
        cleanedContent = cleanedContent.replace(/^[*-]\s+/gm, '');
        cleanedContent = cleanedContent.replace(/^\d+\.\s+/gm, ''); // Numbered lists

        // Normalize whitespace: split into lines, trim each line, filter out purely empty lines,
        // then rejoin with single newlines and trim the entire result.
        return cleanedContent
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .join('\n')
            .trim();
    }

    // If neither method found any system prompt content, return an empty string.
    return '';
}