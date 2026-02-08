# Documentação de Configuração

Este documento descreve todas as opções de configuração disponíveis no arquivo de configuração do agente.

## Estrutura do Arquivo

O arquivo de configuração aceita os formatos `.json`, `.yml` ou `.yaml` e deve ser nomeado como `agent.config.json`, `agent.config.yml` ou `agent.config.yaml`.

---

## project

Define as configurações relacionadas ao projeto onde o agente irá trabalhar.

### project.workspace
- **Tipo:** string
- **Obrigatório:** Sim
- **Descrição:** Caminho do diretório onde o agente tem permissão para escrever código. O agente terá acesso a todos os subdiretórios dentro deste caminho.
- **Exemplo:** `"./src"`, `"./app"`, `"./lib"`

### project.testDir
- **Tipo:** string
- **Obrigatório:** Sim
- **Descrição:** Caminho do diretório raiz onde os comandos de execução e teste serão executados. Este é o diretório onde o agente irá rodar os comandos definidos em `commands.run` e `commands.test` para verificar se o código está funcionando corretamente.
- **Exemplo:** `"./"`, `"./backend"`, `"./frontend"`

### project.versionControl

Configurações de controle de versão Git.

#### project.versionControl.before
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Se true, cria um commit Git antes do agente começar a trabalhar. Isso permite reverter todas as mudanças caso algo dê errado.

#### project.versionControl.after
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Se true, cria um commit Git automaticamente após o agente terminar o trabalho com sucesso.

#### project.versionControl.generateNotes
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Se true, gera um arquivo de anotações documentando todas as mudanças feitas pelo agente, incluindo arquivos modificados, razões das mudanças e decisões tomadas. Este arquivo é útil para revisão e histórico.

---

## model

Configurações do modelo de linguagem que o agente utilizará.

### model.primary

Define o modelo principal que será utilizado.

#### model.primary.provider
- **Tipo:** string
- **Obrigatório:** Sim
- **Valores aceitos:** `"google"`, `"anthropic"`, `"openai"`, `"ollama"`, `"llamacpp"`, `"openrouter"`
- **Descrição:** Provedor do modelo de linguagem. A escolha do provedor determina automaticamente se o modelo é local ou cloud. Provedores `"ollama"` e `"llamacpp"` são locais, os demais são cloud.

#### model.primary.name
- **Tipo:** string
- **Obrigatório:** Sim
- **Descrição:** Nome exato do modelo a ser utilizado. Para modelos cloud, use o nome oficial da API. Para modelos locais, use o nome do modelo no Ollama ou o nome do arquivo GGUF.
- **Exemplos cloud:** `"gemini-2.5-flash"`, `"claude-sonnet-4"`, `"gpt-4"`
- **Exemplos local:** `"llama3.2:3b"`, `"qwen-32b-q4.gguf"`

### model.fallback
- **Tipo:** array
- **Padrão:** array vazio
- **Descrição:** Lista de modelos de backup que serão utilizados caso o modelo principal falhe ou atinja o limite de requisições. Cada item do array deve conter `provider` e `name`.
- **Exemplo de uso:**
```json
    "fallback": [
      {
        "provider": "google",
        "name": "gemini-1.5-flash"
      },
      {
        "provider": "anthropic",
        "name": "claude-haiku-4"
      }
    ]
```

### model.endpoint
- **Tipo:** string ou null
- **Padrão:** null
- **Descrição:** URL do endpoint da API. Necessário apenas para modelos locais (`"ollama"` ou `"llamacpp"`). Para Ollama, tipicamente `"http://localhost:11434"`. Para llama.cpp, tipicamente `"http://127.0.0.1:8080"`. Para modelos cloud, deixe como null.

### model.parameters
- **Tipo:** object
- **Padrão:** objeto vazio
- **Descrição:** Parâmetros avançados de inferência. Funciona apenas com o provedor `"llamacpp"`. Permite configurar opções como contexto, layers GPU, temperatura e outras configurações específicas do llama.cpp.
- **Exemplo de uso:**
```json
    "parameters": {
      "n_ctx": 8192,
      "n_gpu_layers": 35,
      "temperature": 0.7,
      "top_p": 0.9
    }
```

---

## smartRotation

Sistema de rotação inteligente de modelos baseado na complexidade da tarefa.

### smartRotation.enabled
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa o sistema de rotação inteligente. Quando ativo, o agente avalia a complexidade da tarefa e escolhe automaticamente entre modelos simples e complexos para otimizar custo e performance. O sistema tenta modelos simples primeiro e escala para modelos complexos quando necessário.

### smartRotation.simple
- **Tipo:** array
- **Padrão:** array vazio
- **Descrição:** Lista de modelos para tarefas simples como correções pequenas, formatação, tarefas repetitivas e mudanças triviais. O agente tentará esses modelos primeiro. Cada item pode ser uma string com o nome do modelo ou um objeto com `provider` e `name`.
- **Exemplo de uso:**
```json
    "simple": [
      "llama3.2:3b",
      "gemini-1.5-flash"
    ]
```

### smartRotation.complex
- **Tipo:** array
- **Padrão:** array vazio
- **Descrição:** Lista de modelos para tarefas complexas como arquitetura de software, refatoração grande, debugging difícil e implementações avançadas. O sistema usa esses modelos quando tarefas simples falharem repetidamente ou quando a complexidade inicial for alta.
- **Exemplo de uso:**
```json
    "complex": [
      "gemini-2.5-flash",
      "claude-sonnet-4",
      "gpt-4"
    ]
```

---

## limits

Configurações de limites de segurança para controlar o uso de recursos e prevenir execuções descontroladas.

### limits.tokens
- **Tipo:** number ou string `"infinity"`
- **Padrão:** `"infinity"`
- **Descrição:** Limite máximo de tokens que o agente pode consumir durante toda a execução. Quando o limite é atingido, o agente para de executar. Use `"infinity"` para execução sem limites ou um número inteiro para definir o máximo de tokens permitidos.

### limits.loops
- **Tipo:** number ou string `"infinity"`
- **Padrão:** `"infinity"`
- **Descrição:** Número máximo de iterações (loops) que o agente pode executar. Cada tentativa de gerar código, testar e corrigir conta como uma iteração. Previne loops infinitos. Use `"infinity"` para execução sem limites ou um número inteiro para o máximo de iterações.

### limits.timeout

Configurações de timeout para execuções longas.

#### limits.timeout.enabled
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa o sistema de timeout. Quando ativo, monitora o tempo de execução do agente e aciona ações quando o limite de tempo é atingido.

#### limits.timeout.duration
- **Tipo:** string
- **Padrão:** `"1h"`
- **Descrição:** Tempo máximo de execução antes de acionar uma ação. Use sufixos `m` para minutos e `h` para horas.
- **Formatos aceitos:** `"30m"` (30 minutos), `"1h"` (1 hora), `"2h30m"` (2 horas e 30 minutos)

#### limits.timeout.notify
- **Tipo:** boolean
- **Padrão:** true
- **Descrição:** Define o comportamento ao atingir o timeout. Se true, envia uma notificação para o usuário perguntando se deseja continuar ou cancelar a execução. Se false, cancela automaticamente a execução ao atingir o timeout sem perguntar.

---

## sandbox

Configurações de isolamento de execução para testes seguros do código gerado.

### sandbox.enabled
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa o modo sandbox. Quando ativo, o código é executado em um ambiente isolado antes de ser escrito no projeto real. O código só é aplicado ao projeto original após ser testado com sucesso no sandbox. Se desativado, o código é escrito diretamente no projeto sem isolamento.

### sandbox.engine
- **Tipo:** string
- **Padrão:** `"docker"`
- **Valores aceitos:** `"docker"` (atualmente único suportado, preparado para expansão futura como `"podman"`, `"vm"`)
- **Descrição:** Motor de containerização utilizado para criar o ambiente isolado. Atualmente apenas Docker é suportado, mas a arquitetura permite adicionar outros motores no futuro.

### sandbox.memory
- **Tipo:** string
- **Padrão:** `"512m"`
- **Descrição:** Limite de memória RAM alocada para o container do sandbox. Use sufixos `m` para megabytes ou `g` para gigabytes.
- **Exemplos:** `"256m"`, `"512m"`, `"1g"`, `"2g"`

### sandbox.cpu
- **Tipo:** number
- **Padrão:** 0.5
- **Descrição:** Limite de CPU alocado para o container do sandbox. O valor representa o número de núcleos de CPU. Use valores decimais para frações de núcleo.
- **Exemplos:** `0.5` (meio núcleo), `1.0` (um núcleo completo), `2.0` (dois núcleos)

### sandbox.network
- **Tipo:** string
- **Padrão:** `"none"`
- **Valores aceitos:** `"none"`, `"bridge"`, `"host"`
- **Descrição:** Configuração de rede do container sandbox. Use `"none"` para máximo isolamento (sem acesso à rede), `"bridge"` para acesso à rede isolado, ou `"host"` para acesso direto à rede do host.

---

## commands

Comandos que o agente executará para configurar, rodar e testar o projeto.

### commands.setup
- **Tipo:** string ou null
- **Padrão:** null
- **Descrição:** Comando executado uma única vez no início para configurar o ambiente. Tipicamente usado para instalar dependências. Se null, nenhum comando de setup é executado.
- **Exemplos:** `"npm install"`, `"pip install -r requirements.txt"`, `"cargo build"`

### commands.run
- **Tipo:** string
- **Obrigatório:** Sim
- **Descrição:** Comando executado para rodar o projeto e verificar se o código está funcionando. Este comando é executado no diretório `testDir` após cada mudança de código. O agente analisa a saída para determinar se houve sucesso ou erro.
- **Exemplos:** `"npm run dev"`, `"python main.py"`, `"cargo run"`, `"go run main.go"`

### commands.test
- **Tipo:** string ou null
- **Padrão:** null
- **Descrição:** Comando opcional para executar testes automatizados. Se definido, será executado além do comando `run`. Se null, apenas o comando `run` é utilizado para validação.
- **Exemplos:** `"npm test"`, `"pytest"`, `"cargo test"`

---

## interface

Configurações de interface e canais de comunicação com o agente.

### interface.channel
- **Tipo:** string
- **Padrão:** `"terminal"`
- **Valores aceitos:** `"terminal"`, `"web"`, `"json"`
- **Descrição:** Canal principal de comunicação com o agente. `"terminal"` para interface de linha de comando interativa, `"web"` para interface web local (localhost), `"json"` para passar o prompt diretamente no arquivo de configuração (modo não interativo).

### interface.prompt
- **Tipo:** string ou null
- **Padrão:** null
- **Descrição:** Prompt inicial enviado ao agente. Use quando `channel` for `"json"` para execução não interativa. Se null, o agente espera por input do usuário através do canal escolhido.
- **Exemplo:** `"Crie um sistema de autenticação com JWT e bcrypt"`

### interface.notifications

Configurações de notificações externas para alertas e avisos.

#### interface.notifications.whatsapp
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa notificações via WhatsApp. Requer configuração adicional de credenciais. Usado para enviar alertas quando timeout é atingido ou quando o agente precisa de ajuda.

#### interface.notifications.telegram
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa notificações via Telegram. Requer configuração adicional de bot token. Usado para enviar alertas quando timeout é atingido ou quando o agente precisa de ajuda.

#### interface.notifications.slack
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa notificações via Slack. Requer configuração adicional de webhook. Usado para enviar alertas quando timeout é atingido ou quando o agente precisa de ajuda.

#### interface.notifications.email
- **Tipo:** boolean
- **Padrão:** false
- **Descrição:** Ativa notificações via email. Requer configuração adicional de SMTP. Usado para enviar alertas quando timeout é atingido ou quando o agente precisa de ajuda.

---

## teach

Configurações de contexto adicional para ensinar o agente sobre padrões, documentações e convenções do projeto.

### teach.urls
- **Tipo:** array de strings
- **Padrão:** array vazio
- **Descrição:** Lista de URLs de documentações externas que o agente deve ler antes de começar a trabalhar. O agente fará o download do conteúdo desses sites e usará como contexto adicional. Útil para fornecer documentação oficial de frameworks e bibliotecas.
- **Exemplo de uso:**
```json
    "urls": [
      "https://docs.nestjs.com",
      "https://react.dev/learn",
      "https://docs.python.org/3/"
    ]
```

### teach.files
- **Tipo:** array de strings
- **Padrão:** array vazio
- **Descrição:** Lista de caminhos para arquivos locais que o agente deve ler antes de começar. Suporta apenas arquivos de texto simples (`.txt`, `.md`, `.json`, `.yml`, `.yaml`). Útil para fornecer padrões de código, convenções do projeto e contexto específico.
- **Exemplo de uso:**
```json
    "files": [
      "./CODING_STANDARDS.md",
      "./ARCHITECTURE.md",
      "./project-context.txt"
    ]
```

---

## Exemplos Completos

### Exemplo 1: Configuração Minimalista Cloud
```json
{
  "project": {
    "workspace": "./src",
    "testDir": "./"
  },
  "model": {
    "primary": {
      "provider": "anthropic",
      "name": "claude-sonnet-4"
    }
  },
  "commands": {
    "run": "npm start"
  }
}
```

### Exemplo 2: Configuração Local com Ollama
```json
{
  "project": {
    "workspace": "./src",
    "testDir": "./",
    "versionControl": {
      "before": true,
      "after": true,
      "generateNotes": true
    }
  },
  "model": {
    "primary": {
      "provider": "ollama",
      "name": "qwen2.5-coder:32b"
    },
    "endpoint": "http://localhost:11434"
  },
  "sandbox": {
    "enabled": true,
    "engine": "docker",
    "memory": "1g",
    "cpu": 1.0,
    "network": "none"
  },
  "commands": {
    "setup": "npm install",
    "run": "npm run dev",
    "test": "npm test"
  },
  "teach": {
    "files": ["./CODING_STANDARDS.md"]
  }
}
```

### Exemplo 3: Configuração Avançada com Rotação Inteligente
```json
{
  "project": {
    "workspace": "./src",
    "testDir": "./",
    "versionControl": {
      "before": true,
      "after": true,
      "generateNotes": true
    }
  },
  "model": {
    "primary": {
      "provider": "ollama",
      "name": "llama3.2:3b"
    },
    "endpoint": "http://localhost:11434",
    "fallback": [
      {
        "provider": "google",
        "name": "gemini-2.5-flash"
      },
      {
        "provider": "anthropic",
        "name": "claude-sonnet-4"
      }
    ]
  },
  "smartRotation": {
    "enabled": true,
    "simple": ["llama3.2:3b", "gemini-1.5-flash"],
    "complex": ["gemini-2.5-flash", "claude-sonnet-4"]
  },
  "limits": {
    "tokens": 50000,
    "loops": 100,
    "timeout": {
      "enabled": true,
      "duration": "30m",
      "notify": true
    }
  },
  "sandbox": {
    "enabled": true,
    "engine": "docker",
    "memory": "1g",
    "cpu": 1.0,
    "network": "bridge"
  },
  "commands": {
    "setup": "npm install",
    "run": "npm run dev",
    "test": "npm test"
  },
  "interface": {
    "channel": "web",
    "notifications": {
      "telegram": true
    }
  },
  "teach": {
    "urls": ["https://docs.nestjs.com"],
    "files": ["./ARCHITECTURE.md", "./STANDARDS.json"]
  }
}
```

### Exemplo 4: Configuração llama.cpp com Parâmetros Customizados
```json
{
  "project": {
    "workspace": "./lib",
    "testDir": "./"
  },
  "model": {
    "primary": {
      "provider": "llamacpp",
      "name": "qwen-32b-q4.gguf"
    },
    "endpoint": "http://127.0.0.1:8080",
    "parameters": {
      "n_ctx": 8192,
      "n_gpu_layers": 35,
      "temperature": 0.7,
      "top_p": 0.9,
      "repeat_penalty": 1.1
    }
  },
  "sandbox": {
    "enabled": false
  },
  "commands": {
    "setup": "pip install -r requirements.txt",
    "run": "python main.py"
  },
  "teach": {
    "urls": ["https://docs.python.org/3/"],
    "files": ["./project-context.txt"]
  }
}
```