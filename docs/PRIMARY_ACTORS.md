# Primary Actors (Atores Primários) - BoxSafe Hexagonal Architecture

## Definição
**Primary Actors** são os elementos externos que **iniciam ações** no sistema BoxSafe. Eles são o ponto de entrada e controlam o fluxo de execução.

## Primary Actors Identificados

### 1. **CLI (Command Line Interface)**
- **Descrição**: Interface de linha de comando principal do BoxSafe
- **Ponto de Entrada**: `main.ts`
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: `boxsafe run --prompt "criar função X"`

### 2. **IDE Extensions**
- **Descrição**: Extensões para VS Code, IntelliJ, etc.
- **Ponto de Entrada**: API do sistema de segmentos
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: Botão "Run BoxSafe" na IDE

### 3. **Web Interface**
- **Descrição**: Interface web para uso do BoxSafe
- **Ponto de Entrada**: Endpoint HTTP/REST
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: Formulário web com prompt e configurações

### 4. **API Clients**
- **Descrição**: Clientes programáticos que usam BoxSafe
- **Ponto de Entrada**: API REST ou GraphQL
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: `POST /api/v1/execute`

### 5. **Scheduled Jobs/Cron**
- **Descrição**: Tarefas agendadas que executam BoxSafe
- **Ponto de Entrada**: Scheduler externo
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: Job noturno para analisar código

### 6. **CI/CD Pipelines**
- **Descrição**: Integração com pipelines de CI/CD
- **Ponto de Entrada**: Hooks do pipeline
- **Como interage**: Através do `ISystemExecutionPort.executeSegment()`
- **Exemplo de uso**: Step do GitHub Actions

## Fluxo de Interação

```
Primary Actor → ISystemExecutionPort → Core Business Logic
     ↓
[CLI/IDE/Web] → [executeSegment()] → [Segment Handler]
     ↓
Configuration → ISystemConfigurationPort → [loadConfiguration()]
```

## Características dos Primary Actors

1. **Iniciam a ação**: São eles que começam o processo
2. **Controlam o fluxo**: Determinam quando e como executar
3. **Fornecem configuração**: Passam parâmetros e opções
4. **Recebem resultados**: Obtêm o output da execução
5. **São externos ao core**: Não fazem parte do domínio do BoxSafe

## Mapeamento para Código Atual

| Primary Actor | Implementação Atual | Port Correspondente |
|---------------|-------------------|---------------------|
| CLI | `main.ts` | `ISystemExecutionPort` |
| IDE Extensions | Futuro | `ISystemExecutionPort` |
| Web Interface | Futuro | `ISystemExecutionPort` |
| API Clients | Futuro | `ISystemExecutionPort` |
| Scheduled Jobs | Futuro | `ISystemExecutionPort` |
| CI/CD Pipelines | Futuro | `ISystemExecutionPort` |

## Próximos Passos

1. Implementar adapters específicos para cada Primary Actor
2. Criar pontos de entrada dedicados (CLI, Web, API)
3. Documentar interfaces para cada tipo de ator
4. Implementar autenticação e autorização por ator
