import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { ANSI } from '@util/ANSI';
interface ExtractCodeOptions {
  /**
   * If true, throws error when code is not found.
   * If false, returns guidance prompt.
   * @default false
   */
  throwOnNotFound?: boolean;
  
  /**
   * Custom message when code is not found
   */
  customNotFoundMessage?: string;
}

/**
 * Extracts code blocks of a specific language from Markdown.
 * 
 * If no code is found, returns a prompt guiding the LLM
 * to generate only the requested code, without explanations.
 * 
 * @param md - Markdown string (usually LLM response)
 * @param lang - Code language (javascript, python, etc)
 * @param options - Configuration options
 * @returns Array of found code blocks or error prompt
 */
export const extractCode = async (
  md: string,
  lang: string,
  options: ExtractCodeOptions = {}
): Promise<string[]> => {
  const { throwOnNotFound = false, customNotFoundMessage } = options;
  
  // Input validation
  if (!md || typeof md !== 'string') {
    throw new Error(`${ANSI.Red}[⚠️ERROR(extractcode)] Invalid markdown input: expected non-empty string${ANSI.Reset}`);
  }
  
  if (!lang || typeof lang !== 'string') {
    throw new Error(`${ANSI.Red}[⚠️ERROR(extractcode)] Invalid language: expected non-empty string${ANSI.Reset}`);
  }
  
  const codeBlocks: string[] = [];
  const normalizedLang = lang.toLowerCase().trim();
  
  try {
    await remark()
      .use(() => (tree) => {
        visit(tree, 'code', (node: any) => {
          const nodeLang = node.lang?.toLowerCase().trim();
          
          // Support common aliases
          const langAliases: Record<string, string[]> = {
            javascript: ['javascript', 'js', ],
            typescript: ['typescript', 'ts'],
            python: ['python', 'py'],
            bash: ['bash', 'sh', 'shell'],
            rust: ['rust', 'rs'],
          };
          
          // Check if language matches
          const matches = Object.entries(langAliases).some(([key, aliases]) => {
            return aliases.includes(normalizedLang) && aliases.includes(nodeLang);
          }) || nodeLang === normalizedLang;
          
          if (matches && node.value) {
            codeBlocks.push(node.value.trim());
          }
        });
      })
      .process(md);
    
    // If no code found, return guidance prompt
    if (codeBlocks.length === 0) {
      if (throwOnNotFound) {
        throw new Error(`${ANSI.Red}[⚠️ERROR(extractcode)] No ${lang} code block found in markdown${ANSI.Reset}`);
      }
      
      const errorPrompt = customNotFoundMessage || generateNotFoundPrompt(lang);
      
      // Return as array to maintain consistent interface
      return [errorPrompt];
    }
    
    return codeBlocks;
    
  } catch (error) {
    console.error(`${ANSI.Red}[⚠️ERROR(extractcode)] Failed to parse markdown: ${error}${ANSI.Reset}`);
    throw new Error(`${ANSI.Red}[⚠️ERROR(extractcode)] Failed to extract code: ${error instanceof Error ? error.message : 'unknown error'}${ANSI.Reset}`);
  }
};

/**
 * Generates guidance prompt when code is not found
 */
function generateNotFoundPrompt(lang: string): string {
  return `ERROR: ${lang} code was not found in the response.

MANDATORY INSTRUCTIONS:
1. Generate ONLY the requested ${lang} code
2. Use the correct code block format: \`\`\`${lang}
3. DO NOT include explanations, descriptions, or additional text
4. DO NOT generate multiple code blocks
5. The code will be executed directly - it will not be read by humans
6. Do not use markdown for anything other than the code block
7. Return ONLY a single functional code block

Correct format example:
\`\`\`${lang}
// your code here
\`\`\`

Generate the ${lang} code now following these instructions.`;
}
