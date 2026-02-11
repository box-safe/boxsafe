/**
 * Interpreta uma string Markdown, tipicamente de um contexto "prompt-system",
 * e a transforma em uma string limpa, removendo toda a formatação Markdown.
 *
 * Esta função realiza os seguintes passos de limpeza:
 * 1. Remove blocos de código cercados (fenced code blocks), mantendo apenas o seu conteúdo.
 * 2. Remove comentários HTML.
 * 3. Remove a sintaxe de imagens (ex: `![alt text](url)` torna-se `alt text`).
 * 4. Remove a sintaxe de links (ex: `[texto do link](url)` torna-se `texto do link`).
 * 5. Remove marcadores de cabeçalho (ex: `# Cabeçalho` torna-se `Cabeçalho`).
 * 6. Remove marcadores de citação (ex: `> Citação` torna-se `Citação`).
 * 7. Remove marcadores de itens de lista (ex: `- Item`, `1. Item` torna-se `Item`),
 *    e quaisquer espaços iniciais relacionados à indentação da lista.
 * 8. Remove regras horizontais (ex: `---`).
 * 9. Remove marcadores de negrito e itálico (ex: `**texto**`, `*texto*` torna-se `texto`).
 * 10. Remove marcadores de código inline (ex: `` `código` `` torna-se `código`).
 * 11. Reduz múltiplas linhas em branco consecutivas para no máximo duas (preserva quebras de parágrafo).
 * 12. Remove espaços em branco iniciais/finais de cada linha e da string final.
 *
 * @param markdownString A string Markdown de entrada.
 * @returns Uma string limpa com a formatação Markdown removida.
 */
function cleanMarkdownPrompt(markdownString: string): string {
    let cleanedString = markdownString;

    // 1. Lida com blocos de código cercados (fenced code blocks) primeiro: ```lang\ncode\n``` -> code
    // Captura o conteúdo e substitui o bloco inteiro apenas pelo seu conteúdo.
    cleanedString = cleanedString.replace(/^```[a-z]*\s*\n([\s\S]*?)\n```$/gm, (match, p1) => {
        // Retorna o conteúdo do bloco de código, preservando suas quebras de linha internas.
        return p1;
    });

    // 2. Remove comentários HTML: <!-- comentário -->
    cleanedString = cleanedString.replace(/<!--[\s\S]*?-->/g, '');

    // 3. Remove Imagens: `![alt text](url)` -> `alt text`
    cleanedString = cleanedString.replace(/!\[(.*?)\]\(.*?\)/g, '$1');

    // 4. Remove Links: `[link text](url)` -> `link text`
    cleanedString = cleanedString.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // 5. Remove Cabeçalhos: `# Header` -> `Header`
    cleanedString = cleanedString.replace(/^(#+)\s*(.*)$/gm, '$2');

    // 6. Remove Citações em Bloco: `> Quote` -> `Quote`
    cleanedString = cleanedString.replace(/^>\s*(.*)$/gm, '$1');

    // 7. Remove marcadores de itens de lista: `- Item`, `* Item`, `1. Item` -> `Item`
    // Remove quaisquer espaços iniciais relacionados à indentação, o marcador de lista e um espaço.
    cleanedString = cleanedString.replace(/^\s*(?:[-*+]|\d+\.)\s*/gm, '');

    // 8. Remove Regras Horizontais: `---`, `***`, `___`
    cleanedString = cleanedString.replace(/^((\s*[-*_]){3,})\s*$/gm, '');

    // 9. Remove Negrito/Itálico (não-guloso)
    // `**texto**` ou `__texto__`
    cleanedString = cleanedString.replace(/(\*\*|__)(.*?)\1/g, '$2');
    // `*texto*` ou `_texto_`
    cleanedString = cleanedString.replace(/(\*|_)(.*?)\1/g, '$2');

    // 10. Remove Código Inline: `` `code` `` -> `code`
    cleanedString = cleanedString.replace(/`([^`]+)`/g, '$1');

    // 11. Limpa quebras de linha excessivas: reduz 3 ou mais quebras de linha para 2
    // (mantém quebras de parágrafo claras sem linhas em branco excessivas).
    cleanedString = cleanedString.replace(/\n{3,}/g, '\n\n');

    // 12. Limpa espaços em branco (trim) em cada linha e na string final.
    // Primeiro, remove espaços em branco iniciais/finais de cada linha.
    cleanedString = cleanedString.split('\n').map(line => line.trim()).join('\n');
    // Depois, remove espaços em branco iniciais/finais de toda a string.
    cleanedString = cleanedString.trim();

    return cleanedString;
}