## DONE

### Core (entrypoint + segments)
- **Entry point minimalista**: [main.ts](cci:7://file:///home/inky/Development/boxsafe/main.ts:0:0-0:0) inicializa [initSegments()](cci:1://file:///home/inky/Development/boxsafe/core/sgmnt/map.ts:9:0-92:1) e executa o segmento [loop](cci:9://file:///home/inky/Development/boxsafe/core/loop:0:0-0:0).
- **Segment map**: [core/sgmnt/map.ts](cci:7://file:///home/inky/Development/boxsafe/core/sgmnt/map.ts:0:0-0:0) centraliza rotas/segmentos ([loop](cci:9://file:///home/inky/Development/boxsafe/core/loop:0:0-0:0), [navigate](cci:9://file:///home/inky/Development/boxsafe/core/navigate:0:0-0:0), `versionControl`) e expõe [runSegment](cci:1://file:///home/inky/Development/boxsafe/core/sgmnt/map.ts:84:2-89:4).

### Loop agente (LLM -> código -> execução -> validação)
- **Loop iterativo**: [core/loop/execLoop.ts](cci:7://file:///home/inky/Development/boxsafe/core/loop/execLoop.ts:0:0-0:0) implementa pipeline determinístico:
  - **Prompt -> LLM** ([ai/caller.ts](cci:7://file:///home/inky/Development/boxsafe/ai/caller.ts:0:0-0:0) + [ai/provider.ts](cci:7://file:///home/inky/Development/boxsafe/ai/provider.ts:0:0-0:0))
  - **Leitura do markdown gerado** em [/dev/shm/receivercodes/codelog.md](cci:7://file:///dev/shm/receivercodes/codelog.md:0:0-0:0) ([core/paths/paths.ts](cci:7://file:///home/inky/Development/boxsafe/core/paths/paths.ts:0:0-0:0))
  - **Extração de código por linguagem** ([util/extractCode.ts](cci:7://file:///home/inky/Development/boxsafe/util/extractCode.ts:0:0-0:0))
  - **Persistência do artefato** (escrita atômica via `.tmp` + `rename`)
  - **Execução do artefato** ([core/cmd/execode.ts](cci:7://file:///home/inky/Development/boxsafe/core/cmd/execode.ts:0:0-0:0))
  - **Validação/score** ([core/loop/waterfall.ts](cci:7://file:///home/inky/Development/boxsafe/core/loop/waterfall.ts:0:0-0:0))
  - **Feedback estruturado** para próxima iteração quando falha
- **Auto-execução quando `cmd="echo OK"`**: executa o arquivo gerado conforme `lang` (TS via `tsx`, JS via `node`, PY via `python`, SH via `bash`).
- **Suporte a “tool calls” no markdown**: detecta blocos JSON fence com `tool`:
  - **navigate**: mapeia ops (`read/write/list/mkdir/delete/stat`) para o [Navigator](cci:2://file:///home/inky/Development/boxsafe/core/navigate/navigator.ts:44:0-433:1)
  - **versionControl**: executa commit/push/notes quando autorizado no config

### Provider de LLM
- **Factory de provider**: [ai/provider.ts](cci:7://file:///home/inky/Development/boxsafe/ai/provider.ts:0:0-0:0) cria adapter para `google` e `openai` via `ai-sdk`, com validação `service x model` ([ai/label.ts](cci:7://file:///home/inky/Development/boxsafe/ai/label.ts:0:0-0:0)).
- **Persistência de saída do LLM**: [ai/caller.ts](cci:7://file:///home/inky/Development/boxsafe/ai/caller.ts:0:0-0:0) grava a resposta em [/dev/shm/receivercodes/codelog.md](cci:7://file:///dev/shm/receivercodes/codelog.md:0:0-0:0) (RAM disk) para consumo do loop.
- **Env key mapping (Gemini)**: suporta `KEYGemini/KEY_GEMINI` mapeando para `GOOGLE_GENERATIVE_AI_API_KEY`/`GOOGLE_API_KEY`.

### Validação (Waterfall)
- **Sistema de score**: [core/loop/waterfall.ts](cci:7://file:///home/inky/Development/boxsafe/core/loop/waterfall.ts:0:0-0:0) aplica validações com pesos:
  - exit code (crítico)
  - stderr (crítico/penalidade)
  - output contract (contratos via `SUCCESS_CONTRACTS` e heurística JSON)
  - artefatos (existência/conteúdo)
- **Threshold de aprovação**: passa com score >= 70.

### Execução de comandos
- **Runner com timeout**: [core/cmd/execode.ts](cci:7://file:///home/inky/Development/boxsafe/core/cmd/execode.ts:0:0-0:0) executa comandos via `spawn(shell: true)` com timeout (SIGTERM) e log em `memo/states-logs/logs.txt`.

### Navegação segura de arquivos (Navigator)
- **Navigator**: `core/navigate/*` oferece operações seguras (`list/read/write/mkdir/delete/stat`) com:
  - boundary enforcement por workspace
  - validação e normalização de paths
  - limite de tamanho de arquivo
  - respostas estruturadas (ok/erro)
- **Handler**: [core/navigate/handler.ts](cci:7://file:///home/inky/Development/boxsafe/core/navigate/handler.ts:0:0-0:0) expõe API única para operações.

### Tasks (TODO -> execução em sequência)
- **TasksManager**: [core/loop/tasks/index.ts](cci:7://file:///home/inky/Development/boxsafe/core/loop/tasks/index.ts:0:0-0:0) carrega tarefas de [TODO.md](cci:7://file:///home/inky/Development/boxsafe/TODO.md:0:0-0:0), materializa em `memo/state/tasks/*` e mantém `state.json`.
- **Integração com loop**: quando configurado, o loop usa a tarefa atual como `feedback`, marca como done ao sucesso e avança.

### Versionamento (Git)
- **Helper de versionamento**: [core/loop/git/index.ts](cci:7://file:///home/inky/Development/boxsafe/core/loop/git/index.ts:0:0-0:0):
  - stage + commit
  - opcionalmente gera [BOXSAFE_VERSION_NOTES.md](cci:7://file:///home/inky/Development/boxsafe/BOXSAFE_VERSION_NOTES.md:0:0-0:0)
  - push opcional e fallback com token (keyring/env)
- **Integração com loop**: commits opcionais `before` e `after` conforme [boxsafe.config.json](cci:7://file:///home/inky/Development/boxsafe/boxsafe.config.json:0:0-0:0).

### Configuração do projeto
- **Config central**: [boxsafe.config.json](cci:7://file:///home/inky/Development/boxsafe/boxsafe.config.json:0:0-0:0) define workspace, limits/loops, model/provider, versionControl e commands.
- **Paths TS**: aliases `@/*`, `@core/*`, `@ai/*`, `@memo/*`, `@util/*` ([tsconfig.json](cci:7://file:///home/inky/Development/boxsafe/tsconfig.json:0:0-0:0)).
- **Docs**: [docs/](cci:9://file:///home/inky/Development/boxsafe/docs:0:0-0:0) documenta navegação, credenciais, versionamento, tasks e config.

### Correções recentes (para rodar robusto)
- **Fix main/loop**: `lang` passou a ser definido (evita erro `Invalid language: expected non-empty string`).
- **Fix execução TS**: auto-run passou de `ts-node` para `tsx`.
- **Config de run**: `commands.run` ajustado para `echo OK` para ativar auto-execução do artefato no loop.