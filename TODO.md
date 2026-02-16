# BoxSafe TODO - Sistema Inteligente de Prompts

## Status Atual
- ✅ Sistema de tools 100% funcional
- ✅ Parsing de json-tool perfeito
- ✅ Logging consistente implementado
- ❌ Prompt atual incompleto (falta parâmetro `content`)
- ❌ Sistema de prompts hardcoded (gambiarra funcional)

---

## 🎯 Objetivo Principal
Implementar um sistema inteligente de gerenciamento de prompts que:
- Categorize modelos por capacidade (LOW/MEDIUM/HIGH/EXCELLENT)
- Otimize frequência de lembretes baseada no modelo
- Reduza custos com providers
- Melhore a experiência do usuário

---

## 📋 Tasks Organizadas

### Phase 1: Fundação (Crítica)
**1. Criar Sistema de Configuração de Modelos**
- [ ] Criar arquivo `ai/modelConfig.ts` com perfis de modelos
- [ ] Definir categorias: LOW (<8k), MEDIUM (8k-32k), HIGH (32k-128k), EXCELLENT (>128k)
- [ ] Configurar frequências de lembrete por categoria
- [ ] Adicionar metadados de custo por token

**2. Implementar Estratégias de Prompt**
- [ ] Criar prompts específicos por capacidade do modelo
- [ ] Incluir exemplos completos com parâmetro `content`
- [ ] Sistema de lembretes inteligentes
- [ ] Validação de prompts

**3. Integrar com Loop Principal**
- [ ] Substituir prompt hardcoded pelo PromptManager
- [ ] Detectar modelo automaticamente da configuração
- [ ] Implementar sistema de contexto/usage tracking
- [ ] Testar integração completa

### Phase 2: Inteligência (Otimização)
**4. Sistema de Context Awareness**
- [ ] Monitorar uso de contexto em tempo real
- [ ] Trigger de lembretes baseado em threshold
- [ ] Otimização de tokens por interação
- [ ] Sistema de recuperação de erros

**5. Otimização de Custos**
- [ ] Calcular custo por interação
- [ ] Estratégias para reduzir tokens desnecessários
- [ ] Balance entre qualidade e custo
- [ ] Relatórios de uso

**6. Sistema de Aprendizado**
- [ ] Detectar padrões de erros do modelo
- [ ] Adaptar prompts baseado no histórico
- [ ] Sistema de feedback automático
- [ ] Melhoria contínua

### Phase 3: Avançado (Futuro)
**7. Interface de Configuração**
- [ ] CLI para gerenciar modelos
- [ ] Configuração via arquivo YAML/JSON
- [ ] Validação de configurações
- [ ] Documentação interativa

**8. Monitoramento e Analytics**
- [ ] Dashboard de uso de prompts
- [ ] Métricas de performance
- [ ] Alertas de anomalias
- [ ] Sistema de logging avançado

---

## 🔧 Detalhes Técnicos

### Arquivos a Criar:
- `ai/modelConfig.ts` - Configurações dos modelos
- `ai/promptManager.ts` - Sistema inteligente de prompts
- `ai/promptStrategies.ts` - Estratégias por capacidade
- `ai/contextTracker.ts` - Monitoramento de contexto
- `ai/costOptimizer.ts` - Otimização de custos

### Arquivos a Modificar:
- `core/loop/execLoop.ts` - Integrar PromptManager
- `boxsafe.config.json` - Adicionar configurações de modelo
- `ai/prompts.ts` - Migrar para sistema estruturado

### Critérios de Sucesso:
- [ ] Prompt completo com parâmetro `content`
- [ ] Sistema adaptável a diferentes modelos
- [ ] Redução de 30% nos custos de API
- [ ] Zero erros de json-tool incompleto
- [ ] Documentação completa e testada

---

## 🚀 Próximos Passos Imediatos

1. **Discussão**: Validar arquitetura proposta
2. **Prioridade**: Phase 1 (fundação crítica)
3. **Execução**: Implementar task por task com validação
4. **Testes**: Garantir funcionamento em todos os modelos
5. **Deploy**: Substituir sistema atual

---

## 📝 Notas
- Manter compatibilidade com sistema atual
- Implementar fallbacks para modelos desconhecidos
- Considerar modelos locais vs API
- Performance crítica para não impactar o loop

Dynamic Tool Loading: Só injete as tools relevantes ao contexto atual
Schema Compression: Para modelos fracos, use schemas simplificados
  1. Início: Ensina TUDO (full system prompt + todas as tools)
  2. Durante: Relembra periodicamente baseado em:
    • Qualidade do modelo (tier)
    • Frequência de uso das tools
  3. Otimização: Prompts compactos para modelos fracos
2. uso eficiente ded sistema de caching dos provaders integrar todas os plugs para economizar tokes oferecido pelo provider

3. criação de (RAG)


16. tool para busca inteligente, o modelo não sabe aonde um metodo ou função em expecifica ou qualquer coisa dentro do de um codigo esta mas ele consegue de forma inteligente so por um trecho do codigo achar 
sem indicação externa 

17. usar script sheel para comandos fixo do projeto para ter menos codigo com comandos misturados 