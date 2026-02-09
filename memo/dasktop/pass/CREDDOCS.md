# Credenciais Linux (credLinux)

Módulo para gerenciar credenciais usando o **secret-tool** do Linux (keyring nativo).

## Requisitos

- Linux com `secret-tool` instalado (já vem na maioria das distros)
- Funciona em qualquer desktop environment (GNOME, KDE, XFCE, etc.)

## Importação

```typescript
import { saveCredLinux, getCredLinux, deleteCredLinux } from '@memo/desktop/pass';
```

## Funções

### `saveCredLinux()`

Salva uma credencial no keyring do sistema.

```typescript
const success = await saveCredLinux({
  password: 'minha-senha-secreta',
  label: 'GitHub Token',
  account: 'gh-token',
  service: 'meu-app' // opcional, default: 'box-safe'
});

// Retorna: true (sucesso) | false (erro)
```

### `getCredLinux()`

Recupera uma credencial salva.

```typescript
const token = await getCredLinux({
  account: 'gh-token',
  service: 'meu-app' // opcional, default: 'box-safe'
});

// Retorna: string (senha) | null (não encontrada)
```

### `deleteCredLinux()`

Remove uma credencial do keyring.

```typescript
const deleted = await deleteCredLinux({
  account: 'gh-token',
  service: 'meu-app' // opcional, default: 'box-safe'
});

// Retorna: true (sucesso) | false (erro)
```

## Exemplo Completo

```typescript
// Salvar API key
await saveCredLinux({
  password: 'sk-xxxxxxxxxxxxx',
  label: 'OpenAI API Key',
  account: 'openai-key'
});

// Usar depois
const apiKey = await getCredLinux({ account: 'openai-key' });
if (apiKey) {
  console.log('Key encontrada:', apiKey);
}

// Limpar quando não precisar mais
await deleteCredLinux({ account: 'openai-key' });
```

## Parâmetros

### CredentialArgs (save)
- `password`: senha/token a salvar
- `label`: descrição amigável (aparece na GUI do keyring)
- `account`: identificador único da credencial
- `service`: (opcional) nome do app/serviço (default: `box-safe`)

### LookupArgs (get/delete)
- `account`: identificador da credencial
- `service`: (opcional) nome do app/serviço (default: `box-safe`)

## Onde ficam salvos?

As credenciais são criptografadas e salvas em:
```
~/.local/share/keyrings/
```

Você pode visualizar usando `seahorse` (GNOME) ou a GUI do seu keyring.

## Logs

O módulo só loga erros no console. Se algo falhar:
- `saveCredLinux`: retorna `false`
- `getCredLinux`: retorna `null`
- `deleteCredLinux`: retorna `false`

Tratamento de erro fica por sua conta.