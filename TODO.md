lembrete usar arquitetura Hexagonal no projeto 

7. tipar o contrato do loop de forma única: exportar LoopOptions/LoopResult de um lugar único e reusar no main.ts (evitar any/index signature)

8. normalizar limits.loops para sempre ser number no loader de config (evitar string|Limit espalhado no runtime)
9. padronizar paths e logs: centralizar em core/paths e corrigir inconsistências/typos de diretórios de log
10. tornar path do markdown gerado e path do artefato configuráveis via config/env (sem hardcode de /dev/shm)
11. endurecer execução de comandos: reduzir uso de shell=true quando possível, validar/escapar args, e tornar timeout configurável
12. separar parser/dispatcher de tool-calls do loop em um módulo próprio com validação forte de schema (JSON fence)
13. adicionar testes básicos unitários para: extractCode, Navigator boundary, waterfall scoring, e config loader
14. criar uma estrutura de pastas consistente para novos segmentos (skills) e definir convenções (ex: core/sgmnt/<segment>/)
15. melhorar observabilidade do loop: IDs por iteração, logs estruturados, e persistência de artifacts por iteração (opcional)