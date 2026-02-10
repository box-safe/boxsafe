lembrete usar arquitetura Hexagonal no projeto 

10. tornar path do markdown gerado e path do artefato configuráveis via config/env (sem hardcode de /dev/shm)
11. endurecer execução de comandos: reduzir uso de shell=true quando possível, validar/escapar args, e tornar timeout configurável
12. separar parser/dispatcher de tool-calls do loop em um módulo próprio com validação forte de schema (JSON fence)
13. adicionar testes básicos unitários para: extractCode, Navigator boundary, waterfall scoring, e config loader
14. criar uma estrutura de pastas consistente para novos segmentos (skills) e definir convenções (ex: core/sgmnt/<segment>/)
15. melhorar observabilidade do loop: IDs por iteração, logs estruturados, e persistência de artifacts por iteração (opcional)



16. criar um sistema de busca por codigo obriagando o modelo indetifica o codigo, exemplo isso ajuda quando  

17. criar sis