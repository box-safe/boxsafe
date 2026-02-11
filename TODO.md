lembrete usar arquitetura Hexagonal no projeto 

# Tarefas - Arquitetura Hexagonal

## Alta Prioridade
- [x] hex-01: Definir e documentar os Ports da arquitetura hexagonal - interfaces que definem contratos entre o core e o mundo externo
- [x] hex-02: Identificar e organizar Primary Actors (atores primários) - quem inicia as ações no sistema  
- [x] hex-03: Identificar e organizar Secondary Actors (atores secundários) - sistemas externos que o sistema consome

## Média Prioridade
- [x] hex-04: Criar pasta core/ports para centralizar todas as interfaces de ports da arquitetura hexagonal
- [x] hex-05: Criar pasta core/adapters para organizar os adapters que implementam os ports
- [ ] hex-06: Refatorar módulo navigate para seguir explicitamente o padrão hexagonal com ports bem definidos
- [ ] hex-07: Refatorar módulo loop para seguir explicitamente o padrão hexagonal com ports bem definidos
- [ ] hex-08: Refatorar módulo auth para seguir explicitamente o padrão hexagonal com ports bem definidos

## Baixa Prioridade
- [ ] hex-09: Criar diagrama da arquitetura hexagonal do BoxSafe documentando ports, adapters e atores
- [ ] hex-10: Atualizar documentação do projeto com a nova estrutura hexagonal formalizada

# Tarefas Antigas
15. fazer o modelo emitir um json-tool para poder controlar as tools 

16. tool para busca inteligente, o modelo não sabe aonde um metodo ou função em expecifica ou qualquer coisa dentro do de um codigo esta mas ele consegue de forma inteligente so por um trecho do codigo achar 
sem indicação externa 

17. usar script sheel para comandos fixo do projeto para ter menos codigo com comandos misturados 