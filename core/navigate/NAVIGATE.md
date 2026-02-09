# Navigate Module — Documentação Completa

Este documento descreve o funcionamento, a API e as melhores práticas do módulo `core/navigate` do projeto BoxSafe. O objetivo é oferecer uma referência completa, clara e utilizável pelo time e por agentes (LLMs).

## Visão Geral

O módulo `navigate` fornece um conjunto seguro e tipado de operações de sistema de ficheiros confinadas a um `workspace` definido. Ele é projetado para permitir que um agente (LLM) ou código do sistema:

- Liste diretórios com metadados
- Leia arquivos com limite de tamanho
- Escreva/atualize arquivos (criando diretórios pais quando solicitado)
- Crie diretórios (recursivos)
- Delete arquivos e diretórios (recursivo opcional)
- Consulte metadados de arquivos/pastas

Características principais:

- Boundary enforcement: todas as operações são validadas para permanecer dentro do `workspace` configurado.
- Permissões: verificação de leitura/escrita antes de executar ações sensíveis.
- Limits: leitura de arquivos limitada por tamanho configurável (padrão 10MB).
- Tipos TS explícitos: `Navigator`, `NavigatorHandler` e resultados estruturados.

## Arquivos Principais

- `navigator.ts` — implementação principal da classe `Navigator`.
- `handler.ts` — adaptador `NavigatorHandler` para uso por rotas/sgmnt.
- `utils.ts` — utilitários de segurança e validação de paths (resolução, checagem de permissões, sanitização).
- `types.ts` — definições de tipos exportadas (resultados, entradas, config).
- `examples.ts` — exemplos práticos de uso do módulo.
- `navigate.test.ts` — testes unitários de integração mínima.
- `NAVIGATEDOC.md` — esta documentação.

## Conceitos e Contratos

Tipos principais (resumo):

- `NavigatorConfig` — { workspace: string; followSymlinks?: boolean; maxFileSize?: number; logger?: Logger }
- `FileSystemEntry` — { path, name, type: 'file'|'directory', size?, mtime?, readable, writable }
- `DirectoryListing` — sucesso de listagem: { ok: true, path, entries: FileSystemEntry[], total }
- `FileReadResult` — leitura: { ok: true, path, content, size, encoding }
- `FileWriteResult` — escrita: { ok: true, path, size, created }
- `DirectoryCreateResult` — criação de pasta: { ok: true, path, created }
- `DeleteResult` — remoção: { ok: true, path, type, deletedAt }
- `MetadataResult` — metadados: { ok: true, path, stat: { type, size, mtime, isReadable, isWritable } }
- `OperationError` — falha simples: { ok: false, operation, error }

Observação: as respostas são discriminadas por `ok: true | false`. Use type guards (ou checagem de propriedades) para reduzir o tipo retornado antes de acessar campos específicos.

## Inicialização

Use `createNavigator` quando precisar trabalhar diretamente com a API programática:

```ts
import { createNavigator } from '@core/navigate';

const nav = createNavigator({
  workspace: '/home/inky/Development/boxsafe',
  maxFileSize: 10 * 1024 * 1024, // 10MB
});
```

Para integrar com a camada de rotas/segmentos (sgmnt), use `createNavigatorHandler`:

```ts
import { createNavigatorHandler } from '@core/navigate';

const handler = createNavigatorHandler('/home/inky/Development/boxsafe');
await handler.execute({ op: 'list', path: 'src' });
```

## API (métodos do `Navigator`)

- `listDirectory(dirPath?: string) => Promise<DirectoryListing | OperationError>`
  - Lista conteúdo com `FileSystemEntry[]` e metadados.
  - Ordena: diretórios primeiro, depois arquivos alfabeticamente.

- `readFile(filePath: string) => Promise<FileReadResult | OperationError>`
  - Verifica permissões e limite de tamanho antes de ler.
  - Retorna `encoding: 'utf-8'` e `size` (bytes).

- `writeFile(filePath: string, content: string, options?: { append?: boolean; createDirs?: boolean }) => Promise<FileWriteResult | OperationError>`
  - Se `createDirs: true`, cria diretórios pai automaticamente.
  - Suporta `append` para anexar conteúdo.

- `createDirectory(dirPath: string, options?: { recursive?: boolean }) => Promise<DirectoryCreateResult | OperationError>`

- `delete(targetPath: string, options?: { recursive?: boolean }) => Promise<DeleteResult | OperationError>`
  - Para diretórios, `recursive` padrão é `true` no handler; seja cauteloso.

- `getMetadata(targetPath: string) => Promise<MetadataResult | OperationError>`
  - Perfeito para decidir se deve ler ou não (tamanho / permissões).

### Observação sobre erros

O `OperationError` contém `operation` e `error` (mensagem curta). Não expõe paths resolvidos para manter erro simples e consistente — o logger interno registra detalhes quando necessário.

## Boas práticas (para humanos e LLMs)

1. Sempre verifique `result.ok` ou use type guards antes de acessar propriedades específicas.
2. Prefira caminhos relativos ao workspace (`src/main.ts`) em vez de absolutos.
3. Use `createDirs: true` em `writeFile` quando o destino puder não existir.
4. Evite ler arquivos muito grandes — use `getMetadata` e respeite `maxFileSize`.
5. Não confie somente em mensagens do agente — valide operações críticas externamente (p.ex. testes automatizados).

## Exemplos práticos

Listar diretório e ler um arquivo condicionalmente:

```ts
const list = await nav.listDirectory('src');
if (list.ok) {
  for (const e of list.entries) {
    if (e.type === 'file' && e.size && e.size < 1024 * 1024) {
      const r = await nav.readFile(e.path);
      if (r.ok) console.log(r.content.slice(0, 200));
    }
  }
}
```

Criar estrutura e escrever múltiplos arquivos:

```ts
await nav.createDirectory('output/generated', { recursive: true });
await nav.writeFile('output/generated/index.ts', "export * from './types'", { createDirs: true });
```

Usando o `NavigatorHandler` (útil para integração com sgmnt):

```ts
const handler = createNavigatorHandler('/home/inky/Development/boxsafe');
const res = await handler.execute({ op: 'write', path: 'out/result.txt', content: 'ok', writeOptions: { createDirs: true } });
if (!res.ok) console.error('Handler error', res.error);
```

## Integração com `sgmnt` (map)

No `core/sgmnt/map.ts` você pode adicionar uma rota/entry que instancie o handler com o workspace do `BS.config.json`:

```ts
navigate: {
  handler: async (params?: any) => {
    const mod = await import('@core/navigate');
    const handler = mod.createNavigatorHandler(BSConfig.project?.workspace ?? './');
    return handler.execute(params);
  },
  meta: { description: 'File navigation with workspace boundary', implemented: true }
}
```

## Segurança e Limitações

- A validação de `workspace` evita directory traversal. Se um path calculado estiver fora do `workspace`, a operação falha com `OperationError`.
- `followSymlinks` está desligado por padrão; habilite com cautela.
- O módulo não tenta contornar políticas de OS; ele respeita permissões do usuário que executa o processo.

## Testes e Validação

Executar a suite de testes localmente (ex.: `navigate.test.ts`) é recomendado após mudanças:

```bash
# rodar apenas o teste do navigate (exemplo usando tsx/ts-node conforme projeto)
npx tsx core/navigate/navigate.test.ts

# ou rodar verificação TypeScript
npx tsc --noEmit
```

## Troubleshooting rápido

- Erro `Access denied` ao ler/escrever: verifique permissões do processo e se o arquivo está dentro do `workspace`.
- `File size exceeds limit`: aumente `maxFileSize` no `NavigatorConfig` ou use streaming externo.
- Mensagens de erro genéricas: confira logs do `logger` (padrão `console`) para detalhes adicionais.

## Notas finais

O `navigate` foi projetado para ser simples, seguro e fácil de integrar com agentes LLM. A API é propositalmente pequena e previsível para minimizar erros de interpretação e facilitar validação automática em loops (ex.: `execLoop`).

Se quiser, eu posso:

- Adicionar exemplos de prompts para LLMs que utilizam o handler.
- Gerar snippets de código para integração em `core/sgmnt/map.ts` automaticamente.
- Criar um CLI leve para operações manuais de navegação para debug.

----
Documento gerado automaticamente — revise e peça ajustes.
