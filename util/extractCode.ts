import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { ANSI } from '@util/ANSI';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Configuration                                */
/* -------------------------------------------------------------------------- */

const LANG_ALIASES: Record<string, string[]> = {
  javascript: ['javascript', 'js'],
  typescript: ['typescript', 'ts'],
  python: ['python', 'py'],
  bash: ['bash', 'sh', 'shell'],
  rust: ['rust', 'rs'],
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function normalizeLang(lang?: string): string | undefined {
  return lang?.toLowerCase().trim();
}

function matchesLanguage(target: string, nodeLang?: string): boolean {
  if (!nodeLang) return false;

  const normalizedNodeLang = normalizeLang(nodeLang);

  if (normalizedNodeLang === target) return true;

  return Object.values(LANG_ALIASES).some(
    (aliases) =>
      aliases.includes(target) && aliases.includes(normalizedNodeLang!)
  );
}

/**
 * Heuristic detection of language from a code snippet when no fence language is provided.
 * Returns true when the snippet contains tokens commonly associated with `target`.
 */
function detectByContent(target: string, code: string): boolean {
  const c = code || '';
  switch (target) {
    case 'typescript':
    case 'ts':
    case 'javascript':
    case 'js':
      return /\b(import|export|const|let|interface|type|from|require\(|console\.log)\b/.test(c);
    case 'python':
    case 'py':
      return /\b(def |import |from |print\()/.test(c);
    case 'bash':
    case 'sh':
    case 'shell':
      return /(^#!\/bin\/bash)|(^#!\/usr\/bin\/env bash)|\becho\b|\bcd\b|\bmkdir\b/.test(c);
    case 'rust':
    case 'rs':
      return /\b(fn |let |use |extern crate)\b/.test(c);
    default:
      return false;
  }
}

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

/* -------------------------------------------------------------------------- */
/*                                   Public                                   */
/* -------------------------------------------------------------------------- */

/**
 * Extracts code blocks of a specific language from Markdown.
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

  if (!md || typeof md !== 'string') {
    throw new Error(
      `${ANSI.Red}[⚠️ERROR(extractcode)] Invalid markdown input: expected non-empty string${ANSI.Reset}`
    );
  }

  if (!lang || typeof lang !== 'string') {
    throw new Error(
      `${ANSI.Red}[⚠️ERROR(extractcode)] Invalid language: expected non-empty string${ANSI.Reset}`
    );
  }

  const codeBlocks: string[] = [];
  const normalizedLang = normalizeLang(lang)!;

  const onVisitCode = (node: any) => {
    if (!node?.value) return;

    // Exact match by explicit fence language
    if (matchesLanguage(normalizedLang, node.lang)) {
      codeBlocks.push(node.value.trim());
      return;
    }

    // Fallback: if the fence had no language, try to heuristically detect
    // the requested language from the code content itself.
    if (!node.lang && detectByContent(normalizedLang, node.value)) {
      codeBlocks.push(node.value.trim());
      return;
    }
  };

  try {
    await remark()
      .use(() => (tree) => {
        visit(tree, 'code', onVisitCode);
      })
      .process(md);

    if (codeBlocks.length === 0) {
      if (throwOnNotFound) {
        throw new Error(
          `${ANSI.Red}[⚠️ERROR(extractcode)] No ${lang} code block found in markdown${ANSI.Reset}`
        );
      }

      // Fallback: try to extract unlabeled fenced blocks or raw code from the
      // entire markdown string when no explicit code nodes were found.
      // 1) unlabeled/any fenced blocks via regex
      const fenceRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
      let m: RegExpExecArray | null;
      while ((m = fenceRegex.exec(md)) !== null) {
        const candidate = m[1].trim();
        if (candidate && (detectByContent(normalizedLang, candidate) || normalizedLang === 'ts' || normalizedLang === 'js')) {
          codeBlocks.push(candidate);
        }
      }

      // 2) If still nothing, heuristically treat the whole markdown as code
      // when it clearly contains tokens for the requested language.
      if (codeBlocks.length === 0 && detectByContent(normalizedLang, md)) {
        // require at least two lines to avoid grabbing short messages
        if ((md.match(/\n/g) || []).length >= 1) {
          codeBlocks.push(md.trim());
        }
      }

      if (codeBlocks.length === 0) {
        if (throwOnNotFound) {
          throw new Error(
            `${ANSI.Red}[⚠️ERROR(extractcode)] No ${lang} code block found in markdown${ANSI.Reset}`
          );
        }

        return [customNotFoundMessage ?? generateNotFoundPrompt(lang)];
      }
    }

    return codeBlocks;
  } catch (error) {
    console.error(
      `${ANSI.Red}[⚠️ERROR(extractcode)] Failed to parse markdown: ${error}${ANSI.Reset}`
    );

    throw new Error(
      `${ANSI.Red}[⚠️ERROR(extractcode)] Failed to extract code: ${
        error instanceof Error ? error.message : 'unknown error'
      }${ANSI.Reset}`
    );
  }
};
