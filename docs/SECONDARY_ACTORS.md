# Secondary Actors (Atores Secundários) - BoxSafe Hexagonal Architecture

## Definição
**Secondary Actors** são os sistemas externos que o BoxSafe **consome** para realizar suas tarefas. Eles fornecem serviços e recursos que o sistema utiliza para funcionar.

## Secondary Actors Identificados

### 1. **AI Model Providers**
- **Descrição**: Provedores de modelos de linguagem
- **Implementação Atual**: Google (Gemini), OpenAI, Anthropic, etc.
- **Port Correspondente**: `IAIModelPort`
- **Como interage**: Envia prompts e recebe respostas
- **Exemplos**:
  - Google Gemini API
  - OpenAI GPT API
  - Anthropic Claude API
  - Azure OpenAI

### 2. **File System**
- **Descrição**: Sistema de arquivos do hospedeiro
- **Implementação Atual**: Node.js `fs` module
- **Port Correspondente**: `IFileSystemPort`
- **Como interage**: Lê, escreve, lista, deleta arquivos e diretórios
- **Exemplos**:
  - Local filesystem
  - Network filesystems
  - Cloud storage (S3, Google Drive)

### 3. **Version Control Systems**
- **Descrição**: Sistemas de controle de versão
- **Implementação Atual**: Git através de comandos shell
- **Port Correspondente**: `IVersionControlPort`
- **Como interage**: Executa comandos git, obtém status, cria commits
- **Exemplos**:
  - Git
  - Mercurial
  - SVN
  - GitHub API
  - GitLab API

### 4. **Command Execution Environment**
- **Descrição**: Ambiente de execução de comandos do sistema
- **Implementação Atual**: Node.js `child_process`
- **Port Correspondente**: `ICommandExecutionPort`
- **Como interage**: Executa comandos shell, scripts, ferramentas
- **Exemplos**:
  - Shell/bash/zsh
  - PowerShell (Windows)
  - Docker containers
  - CI/CD runners

### 5. **Configuration Sources**
- **Descrição**: Fontes de configuração do sistema
- **Implementação Atual**: Arquivo JSON, variáveis de ambiente
- **Port Correspondente**: `ISystemConfigurationPort`
- **Como interage**: Lê e valida configurações
- **Exemplos**:
  - `boxsafe.config.json`
  - Environment variables
  - Remote configuration services
  - Database configuration

### 6. **Logging Systems**
- **Descrição**: Sistemas de logging e monitoramento
- **Implementação Atual**: Console, file logging
- **Port Correspondente**: `LoggerPort`
- **Como interage**: Registra eventos, erros, métricas
- **Exemplos**:
  - Console output
  - File logging
  - Elasticsearch
  - CloudWatch
  - Datadog

### 7. **Network Services**
- **Descrição**: Serviços de rede e comunicação
- **Implementação Atual**: HTTP/HTTPS requests
- **Port Correspondente**: (Futuro) `INetworkPort`
- **Como interage**: Faz requisições HTTP, baixa arquivos
- **Exemplos**:
  - HTTP/HTTPS clients
  - FTP clients
  - WebSocket connections
  - API gateways

### 8. **Authentication/Authorization Services**
- **Descrição**: Serviços de autenticação e autorização
- **Implementação Atual**: Módulo `auth/dasktop`
- **Port Correspondente**: (Futuro) `IAuthServicePort`
- **Como interage**: Valida credenciais, gerencia tokens
- **Exemplos**:
  - OAuth providers
  - LDAP/Active Directory
  - JWT services
  - Custom auth systems

### 9. **Sandbox/Isolation Systems**
- **Descrição**: Sistemas de isolamento e sandbox
- **Implementação Atual**: Configuração Docker
- **Port Correspondente**: (Futuro) `ISandboxPort`
- **Como interage**: Cria ambientes isolados para execução
- **Exemplos**:
  - Docker containers
  - VMs
  - Chroot jails
  - Cloud sandboxes

## Fluxo de Interação

```
Core Business Logic → Secondary Port → Secondary Actor
        ↓                    ↓              ↓
[BoxSafe Loop] → [IAIModelPort] → [Google Gemini]
        ↓                    ↓              ↓
[Navigation] → [IFileSystemPort] → [Local FS]
        ↓                    ↓              ↓
[Version Ctrl] → [IVersionControlPort] → [Git]
```

## Características dos Secondary Actors

1. **São consumidos pelo core**: O BoxSafe inicia a interação
2. **Fornecem serviços**: Oferecem funcionalidades específicas
3. **São substituíveis**: Podem ser trocados por alternativas
4. **Requerem adapters**: Necessitam adaptação para o port
5. **Têm dependências externas**: Podem falhar independentemente

## Mapeamento para Código Atual

| Secondary Actor | Implementação Atual | Port Correspondente | Status |
|-----------------|-------------------|---------------------|---------|
| AI Models | `@ai/label` | `IAIModelPort` | ✅ Implementado |
| File System | `@core/navigate` | `IFileSystemPort` | ✅ Implementado |
| Version Control | `@core/loop/git` | `IVersionControlPort` | ✅ Implementado |
| Command Execution | `@core/loop/cmd` | `ICommandExecutionPort` | ✅ Implementado |
| Configuration | `@core/config` | `ISystemConfigurationPort` | ✅ Implementado |
| Logging | `@util/logger` | `LoggerPort` | ✅ Implementado |
| Network | Manual HTTP | `INetworkPort` | 🔄 Planejado |
| Authentication | `@core/auth` | `IAuthServicePort` | 🔄 Planejado |
| Sandbox | Config only | `ISandboxPort` | 🔄 Planejado |

## Estratégia de Adapters

Cada Secondary Actor requer um adapter específico:

```typescript
// Exemplo: Adapter para Google Gemini
class GoogleGeminiAdapter implements IAIModelPort {
  async sendPrompt(prompt: string): Promise<any> {
    // Implementação específica da API do Google
  }
  
  async configureModel(config: ModelConfig): Promise<void> {
    // Configuração específica
  }
}

// Exemplo: Adapter para FileSystem
class NodeFileSystemAdapter implements IFileSystemPort {
  async listDirectory(path: string): Promise<any> {
    // Implementação usando Node.js fs
  }
  
  // ... outros métodos
}
```

## Benefícios Desta Abordagem

1. **Desacoplamento**: Core não depende de implementações específicas
2. **Testabilidade**: Facilita mocks e testes unitários
3. **Flexibilidade**: Permite trocar provedores facilmente
4. **Manutenibilidade**: Isola mudanças externas
5. **Extensibilidade**: Facilita adição de novos provedores
