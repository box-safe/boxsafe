lembrete usar arquitetura Hexagonal no projeto 

# Tarefas de Debug - Sistema de Tools

## Problema Principal: Agente não consegue manipular arquivos via json-tool

### Status Atual
- ✅ Agente gera json-tool corretamente
- ✅ Sistema agora detecta/parsa o json-tool
- ✅ Sistema de logging corrigido (sem console.log direto)
- ❌ Arquivos não são criados (json-tool incompleto - falta content)
- ❌ Tasks do TODO.md não são seguidas

### Tasks de Debug Prioritárias

1. **Investigar o regex de parsing do json-tool** ✅
   - ✅ Verificar se o regex `/```(?:json|json-tool)\s*([\s\S]*?)\s*```/g` está funcionando
   - ✅ Testar isoladamente com o conteúdo gerado pelo agente
   - ✅ Adicionar logs de debug para mostrar o que está sendo capturado
   - **PROBLEMA ENCONTRADO**: O regex estava capturando o grupo errado devido ao `(?:json|json-tool)`
   - **SOLUÇÃO**: Alterado para `/```json-tool\s*([\s\S]*?)\s*```/g` e criada função alternativa com remark

2. **Debugar a função parseToolCallsFromMarkdown** ✅
   - ✅ Adicionar console.log para mostrar o markdown input
   - ✅ Verificar se o regex está encontrando os blocks
   - ✅ Checar se o JSON.parse está funcionando
   - ✅ **Corrigir sistema de logging** (remover console.log, usar @core/util/logger)
   - **RESULTADO**: Função está perfeita! O problema é que o agente gera json-tool incompleto (falta `content`)

3. **Investigar a ordem de execução no loop** ✅
   - ✅ Verificar se dispatchToolCalls está sendo chamado antes da extração de código
   - ✅ Confirmar se o navigator está inicializado corretamente
   - ✅ Checar se há erros silenciosos no toolDispatcher
   - **RESULTADO**: Ordem de execução perfeita! Navigator funciona, tool calls são processados corretamente

4. **Testar manualmente o sistema de tools** ✅
   - ✅ Criar teste unitário para parseToolCallsFromMarkdown
   - ✅ Testar com diferentes formatos de json-tool
   - ✅ Verificar se o problema é no parsing ou na execução
   - ✅ **Criar testes de integração** para validar o fluxo completo
   - ✅ **Corrigir bug**: remover filtro `!fence.startsWith('{')` que impedia parsing de JSON inválido
   - **RESULTADO**: Sistema de tools está 100% funcional! Problema confirmado estar no prompt do agente

5. **Analisar o sistema de prompts**
   - Verificar se o prompt está claro sobre como usar json-tool
   - Testar diferentes variações do prompt
   - Checar se o modelo entende a sintaxe correta

6. **Investigar o Tasks Manager**
   - Verificar se o TODO.md está sendo lido corretamente
   - Checar se as tasks estão sendo processadas
   - Debugar o sistema de avanço de tasks

# Tarefas Antigas
15. fazer o modelo emitir um json-tool para poder controlar as tools 

16. tool para busca inteligente, o modelo não sabe aonde um metodo ou função em expecifica ou qualquer coisa dentro do de um codigo esta mas ele consegue de forma inteligente so por um trecho do codigo achar 
sem indicação externa 

17. usar script sheel para comandos fixo do projeto para ter menos codigo com comandos misturados 