# 📚 RAG – Roadmap Matemático Essencial
> Objetivo: Entender profundamente busca vetorial e embeddings  
> Foco: Teoria + Prática + Validação
> Tempo estimado: 3-4 semanas (1-2h/dia)

---

# 🚀 FASE 0 — Quick Win (COMEÇAR AQUI!)
**Objetivo:** Ver RAG funcionando ANTES de estudar teoria

## 🎯 Projeto Prático Mínimo
- [ ] Instalar Qdrant local (Docker)
- [ ] Gerar embeddings de 3-5 frases
- [ ] Indexar no Qdrant
- [ ] Fazer busca vetorial simples
- [ ] Ver os scores de similaridade

### 📖 Fontes
**Vídeo (PT-BR):**
- [RAG do Zero - Como Funciona na Prática](https://www.youtube.com/watch?v=T-D1OfcDW1M) - Universo Programado

**Código Prático:**
- [Qdrant Quickstart](https://qdrant.tech/documentation/quick-start/)
- [Mini RAG em 50 linhas](https://github.com/openai/openai-cookbook/blob/main/examples/Question_answering_using_embeddings.ipynb)

### ✅ Checkpoint
- [ ] Consegui fazer uma busca e recuperar o texto mais similar
- [ ] Entendi (mesmo que superficialmente) que texto → vetor → busca

---

# ✅ FASE 1 — Fundamentos Absolutos

## 🔹 1. Vetores em ℝⁿ
**O que aprender:**
- [ ] O que é um vetor (lista de números)
- [ ] Representação geométrica (seta no espaço)
- [ ] Soma de vetores
- [ ] Multiplicação por escalar
- [ ] Vetores em 2D, 3D e alta dimensão

### 📖 Fontes
**Vídeo (PT-BR):**
- [Vetores - Essência da Álgebra Linear](https://www.youtube.com/watch?v=fNk_zzaMoSs) - 3Blue1Brown (legendado PT)

**Texto/Paper:**
- [Introduction to Linear Algebra - MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-1-the-geometry-of-linear-equations/) - Primeiras 10 páginas

**Código Prático:**
- [NumPy Vectors Tutorial](https://numpy.org/doc/stable/user/quickstart.html#the-basics)

### 🏆 Challenge
**Implementar:**
```javascript
// Criar funções sem libs externas:
function addVectors(v1, v2) { /* ... */ }
function scalarMultiply(scalar, vector) { /* ... */ }
function vectorMagnitude(v) { /* ... */ }
```

### ✅ Checkpoint
- [ ] Implementei soma e multiplicação de vetores
- [ ] Entendi que embedding é só um vetor grande

---

## 🔹 2. Produto Escalar (Dot Product)
**O que aprender:**
- [ ] Fórmula: v·w = v₁w₁ + v₂w₂ + ... + vₙwₙ
- [ ] Interpretação geométrica (projeção)
- [ ] Relação com ângulo entre vetores
- [ ] Quando resultado é positivo/negativo/zero

### 📖 Fontes
**Vídeo (PT-BR):**
- [Produto Escalar e Vetorial](https://www.youtube.com/watch?v=LyGKycYT2v0) - Ferreto Matemática

**Texto/Paper:**
- [Dot Product - Better Explained](https://betterexplained.com/articles/vector-calculus-understanding-the-dot-product/)

**Visualização Interativa:**
- [Dot Product Visualization](https://www.geogebra.org/m/cF7RwK3H)

### 🏆 Challenge
**LeetCode Style:**
- Implementar dot product manualmente
- Calcular dot product de 2 embeddings reais do OpenAI
- Prever se textos são similares antes de calcular

### ✅ Checkpoint
- [ ] Implementei dot product do zero
- [ ] Entendi que quanto maior o dot product, mais "alinhados" os vetores

---

## 🔹 3. Norma de um Vetor
**O que aprender:**
- [ ] O que é magnitude/tamanho do vetor
- [ ] Norma Euclidiana: ||v|| = √(v₁² + v₂² + ... + vₙ²)
- [ ] Normalização de vetores (unit vector)
- [ ] Por que normalizar importa para similaridade

### 📖 Fontes
**Vídeo (PT-BR):**
- [Norma de Vetores](https://www.youtube.com/watch?v=8QiXsv7JlaA) - Matemática Rio

**Texto/Paper:**
- [Vector Norms](https://mathworld.wolfram.com/VectorNorm.html) - Wolfram MathWorld (seções 1-3)

### 🏆 Challenge
```javascript
// Implementar:
function euclideanNorm(vector) { /* ... */ }
function normalize(vector) { /* ... */ }

// Testar:
// Normalizar um embedding
// Verificar que norma = 1 após normalização
```

### ✅ Checkpoint
- [ ] Calculei norma de vetores manualmente
- [ ] Normalizei vetores e verifiquei ||v|| = 1

---

# ✅ FASE 2 — Similaridade Vetorial (Coração do RAG)

## 🔹 4. Similaridade de Cosseno
**O que aprender:**
- [ ] Fórmula: cos(θ) = (v·w) / (||v|| ||w||)
- [ ] Por que mede ângulo e não distância
- [ ] Por que ignora magnitude
- [ ] Range: -1 (opostos) a 1 (idênticos)
- [ ] Quando usar cosine vs euclidean

### 📖 Fontes
**Vídeo (PT-BR):**
- [Similaridade de Cosseno Explicada](https://www.youtube.com/watch?v=e9U0QAFbfLI) - Programador Lhama

**Paper:**
- [Cosine Similarity and Cosine Distance](https://arxiv.org/abs/1909.09427) - Seções 1-2

**Código Didático:**
- [Cosine Similarity from Scratch](https://github.com/ashishpatel26/Amazing-Feature-Engineering/blob/master/src/similarity_measures.py)

### 🏆 Challenge
**Kaggle-style:**
- [Text Similarity Challenge](https://www.kaggle.com/code/adamschroeder/cosine-similarity-from-scratch)
- Implementar cosine similarity do zero
- Comparar com sklearn.metrics.pairwise.cosine_similarity
- Calcular similaridade entre 3 textos diferentes

### ✅ Checkpoint
- [ ] Implementei cosine similarity sem libs
- [ ] Testei com embeddings reais e faz sentido

---

## 🔹 5. Distância Euclidiana
**O que aprender:**
- [ ] Fórmula: d(v,w) = √Σ(vᵢ - wᵢ)²
- [ ] Diferença entre distância e ângulo
- [ ] Quando usar euclidean vs cosine
- [ ] Problema da "maldição da dimensionalidade"

### 📖 Fontes
**Vídeo (PT-BR):**
- [Distância Euclidiana](https://www.youtube.com/watch?v=4FpSlaOU_ko) - Sandeco

**Texto Comparativo:**
- [Cosine vs Euclidean Distance](https://cmry.github.io/notes/euclidean-v-cosine) - Blog técnico

### 🏆 Challenge
```javascript
// Implementar ambas e comparar:
function euclideanDistance(v1, v2) { /* ... */ }
function cosineSimilarity(v1, v2) { /* ... */ }

// Dataset de teste:
// 3 frases sobre programação
// 3 frases sobre culinária
// Qual métrica separa melhor os grupos?
```

### ✅ Checkpoint
- [ ] Entendi quando usar cada métrica
- [ ] Testei ambas em dados reais

---

# ✅ FASE 3 — Chunking (CRÍTICO PARA RAG)

## 🔹 6. Text Chunking
**O que aprender:**
- [ ] Por que dividir texto em pedaços
- [ ] Fixed-size chunking
- [ ] Sentence-based chunking
- [ ] Semantic chunking
- [ ] Overlap entre chunks (por que e quanto)
- [ ] Tamanho ideal: 256-512 tokens

### 📖 Fontes
**Vídeo (PT-BR):**
- [Chunking Strategies para RAG](https://www.youtube.com/watch?v=8OJC21T2SL4) - AI Brasil

**Paper Fundamental:**
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) - Seção 3.1

**Repo Didático:**
- [LangChain Text Splitters](https://github.com/langchain-ai/langchain/tree/master/libs/text-splitters) - Ver exemplos

**Artigo Prático:**
- [Chunking Strategies for LLM Applications](https://www.pinecone.io/learn/chunking-strategies/)

### 🏆 Challenge
**Implementar:**
```javascript
// 3 estratégias diferentes:
function fixedSizeChunk(text, size, overlap) { /* ... */ }
function sentenceChunk(text, maxSentences) { /* ... */ }
function semanticChunk(text, embedModel) { /* ... */ }

// Testar com documento de 5000 palavras
// Comparar quantidade e qualidade dos chunks
```

**Teste Real:**
- Pegar um artigo técnico
- Fazer chunking com 3 estratégias
- Gerar embeddings
- Fazer perguntas e ver qual recupera melhor

### ✅ Checkpoint
- [ ] Implementei 3 estratégias de chunking
- [ ] Testei qual funciona melhor para meu caso de uso

---

# ✅ FASE 4 — Embeddings (Texto → Matemática)

## 🔹 7. Embeddings Fundamentais
**O que aprender:**
- [ ] O que é um embedding
- [ ] Como modelos transformam texto em vetor
- [ ] Word2Vec (conceito histórico)
- [ ] Transformers e attention (conceito geral)
- [ ] Por que vetores próximos = significado similar
- [ ] Espaço semântico

### 📖 Fontes
**Vídeo (PT-BR):**
- [O que são Embeddings](https://www.youtube.com/watch?v=wjZofJX0v4M) - Código Fonte TV

**Paper Clássico (ler introdução):**
- [Word2Vec - Efficient Estimation of Word Representations](https://arxiv.org/abs/1301.3781)

**Paper Moderno:**
- [Sentence-BERT: Sentence Embeddings using Siamese BERT](https://arxiv.org/abs/1908.10084) - Seções 1-3

**Visualização Interativa:**
- [Tensorflow Embedding Projector](https://projector.tensorflow.org/)
- [Word2Vec Visualizer](https://anvaka.github.io/pm/#/galaxy/word2vec-wiki)

**Repo Prático:**
- [OpenAI Embeddings Guide](https://github.com/openai/openai-cookbook/blob/main/examples/Embedding_long_inputs.ipynb)

### 🏆 Challenge
**Projeto:**
1. Gerar embeddings de 20 frases (10 sobre tech, 10 sobre esporte)
2. Reduzir dimensionalidade para 2D (usar PCA ou t-SNE)
3. Plotar no gráfico
4. Verificar se formam clusters

**Ferramentas:**
- [Scikit-learn PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html)
- [Plotly para visualização](https://plotly.com/javascript/)

### ✅ Checkpoint
- [ ] Gerei embeddings e visualizei em 2D
- [ ] Entendi que textos similares ficam próximos no espaço

---

# ✅ FASE 5 — Busca Eficiente (Implementação Real)

## 🔹 8. Nearest Neighbor Search
**O que aprender:**
- [ ] O que é k-Nearest Neighbors (kNN)
- [ ] Busca exata (brute force)
- [ ] Por que busca linear não escala
- [ ] Approximate Nearest Neighbor (ANN)
- [ ] Trade-off: velocidade vs precisão

### 📖 Fontes
**Vídeo (PT-BR):**
- [KNN - K-Nearest Neighbors](https://www.youtube.com/watch?v=HVXime0nQeI) - Programação Dinâmica

**Paper Survey:**
- [A Survey of Approximate Nearest Neighbor Search](https://arxiv.org/abs/1908.02143) - Seção 1-2

**Benchmark Interativo:**
- [ANN Benchmarks](http://ann-benchmarks.com/) - Comparar algoritmos

### 🏆 Challenge
**Implementar:**
```javascript
// Busca exata (brute force)
function exactKNN(query, vectors, k) {
  // Calcular similaridade com TODOS
  // Retornar top-k
}

// Medir tempo com:
// 100 vetores
// 1.000 vetores
// 10.000 vetores
// Ver explosão de tempo
```

**Benchmark:**
- Comparar sua implementação com Qdrant
- Ver diferença de velocidade

### ✅ Checkpoint
- [ ] Implementei busca exata
- [ ] Entendi por que preciso de ANN

---

## 🔹 9. HNSW (Hierarchical Navigable Small World)
**O que aprender:**
- [ ] Conceito de grafo de navegação
- [ ] Estrutura hierárquica
- [ ] Como insere novos vetores
- [ ] Como busca (skip list probabilístico)
- [ ] Parâmetros: M e ef

### 📖 Fontes
**Vídeo (PT-BR):**
- [Vector Databases Explicado](https://www.youtube.com/watch?v=dN0lsF2cvm4) - Filipe Deschamps (parte sobre HNSW)

**Paper Original:**
- [Efficient and Robust Approximate Nearest Neighbor Search Using HNSW](https://arxiv.org/abs/1603.09320)

**Visualização:**
- [HNSW Interactive Demo](https://github.com/nmslib/hnswlib) - Ver README com GIFs

**Documentação Técnica:**
- [Qdrant HNSW Implementation](https://qdrant.tech/documentation/concepts/indexing/#hnsw)

### 🏆 Challenge
**Projeto Comparativo:**
1. Indexar 10.000 embeddings
2. Testar busca com diferentes parâmetros HNSW
3. Medir: tempo de busca, recall, memória
4. Documentar trade-offs

**Ferramenta:**
- [Qdrant](https://qdrant.tech/)
- [Weaviate](https://weaviate.io/)

### ✅ Checkpoint
- [ ] Configurei HNSW no Qdrant
- [ ] Entendi impacto dos parâmetros M e ef

---

# ✅ FASE 6 — Espaço Vetorial (Teoria Avançada)

## 🔹 10. Fundamentos de Espaço Vetorial
**O que aprender:**
- [ ] O que é dimensão
- [ ] Base de um espaço vetorial
- [ ] Combinação linear (intuição)
- [ ] Subespaços
- [ ] Por que embeddings têm 384/768/1536 dimensões

### 📖 Fontes
**Vídeo (PT-BR):**
- [Espaços Vetoriais](https://www.youtube.com/watch?v=TgKwz5Ikpc8) - USP Online

**Texto Teórico:**
- [Linear Algebra - Chapter 2](https://www.math.ucdavis.edu/~linear/linear-guest.pdf) - UC Davis (páginas 50-80)

**Opcional (se quiser aprofundar):**
- [3Blue1Brown - Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab) - Playlist completa legendada

### 🏆 Challenge
**Conceitual:**
- Explicar por que não podemos visualizar 768 dimensões
- Desenhar analogia de redução de dimensionalidade
- Entender por que PCA "achata" informação

### ✅ Checkpoint
- [ ] Entendi conceito de dimensionalidade
- [ ] Sei por que embeddings são vetores densos em alta dimensão

---

# ✅ FASE 7 — Avaliação de RAG (Qualidade)

## 🔹 11. Métricas de Retrieval
**O que aprender:**
- [ ] Precision, Recall, F1
- [ ] Mean Reciprocal Rank (MRR)
- [ ] Normalized Discounted Cumulative Gain (NDCG)
- [ ] Hit Rate @ K
- [ ] Como criar dataset de teste

### 📖 Fontes
**Vídeo (PT-BR):**
- [Métricas de Avaliação - ML](https://www.youtube.com/watch?v=Kdsp6soqA7o) - Mario Filho

**Paper Fundamental:**
- [Evaluating RAG Systems](https://arxiv.org/abs/2309.15217) - Seções 3-4

**Repo Prático:**
- [RAG Evaluation Framework](https://github.com/explodinggradients/ragas)

**Artigo Técnico:**
- [How to Evaluate RAG Applications](https://www.confident-ai.com/blog/how-to-evaluate-a-rag-system)

### 🏆 Challenge
**Projeto Final:**
1. Criar dataset de 50 perguntas + respostas corretas
2. Implementar RAG completo
3. Calcular métricas: Precision@5, Recall@5, MRR
4. Testar 3 estratégias de chunking
5. Documentar qual funcionou melhor

**Ferramenta:**
- [RAGAS Framework](https://github.com/explodinggradients/ragas)

### ✅ Checkpoint
- [ ] Avaliei meu RAG com métricas objetivas
- [ ] Sei identificar quando retrieval falha

---

## 🔹 12. Debugging e Otimização
**O que aprender:**
- [ ] Inspecionar scores de similaridade
- [ ] Por que recuperou chunks errados
- [ ] Ajustar top-k (quantidade de chunks)
- [ ] Re-ranking de resultados
- [ ] Hybrid search (keyword + vector)

### 📖 Fontes
**Vídeo (PT-BR):**
- [Otimizando RAG na Prática](https://www.youtube.com/watch?v=UVn2NroKQCw) - AI Pub

**Artigo Prático:**
- [Advanced RAG Techniques](https://blog.llamaindex.ai/a-cheat-sheet-and-some-recipes-for-building-advanced-rag-803a9d94c41b)

**Repo com Exemplos:**
- [LangChain RAG Cookbook](https://github.com/langchain-ai/rag-from-scratch)

### 🏆 Challenge
**Debugging Real:**
1. Implementar logging de scores
2. Identificar falsos positivos
3. Testar hybrid search
4. Implementar re-ranking com cross-encoder

**Dataset de teste:**
- [MS MARCO](https://microsoft.github.io/msmarco/) - Dataset acadêmico

### ✅ Checkpoint
- [ ] Consigo debugar por que RAG falhou
- [ ] Implementei estratégias de melhoria

---

# 🎯 PROJETO FINAL INTEGRADOR

## 🏆 Challenge Master
**Construir RAG Production-Ready:**

### Requisitos:
1. **Dataset:** 100+ documentos sobre tema técnico
2. **Chunking:** Implementar 2 estratégias
3. **Embeddings:** Usar modelo de sua escolha
4. **Vector DB:** Qdrant com HNSW configurado
5. **API:** Endpoint REST para queries
6. **Avaliação:** 30 perguntas de teste + métricas
7. **Logging:** Rastrear todas as queries e scores
8. **Documentação:** README explicando decisões

### Entregáveis:
- [ ] Código no GitHub
- [ ] Métricas documentadas
- [ ] Análise de casos de falha
- [ ] Proposta de melhorias futuras

### Validação:
- Precision@5 > 0.7
- Tempo de resposta < 500ms
- Recall@10 > 0.8

---

# 📊 Ordem de Prioridade Revisada

## 🔥 Altíssima (NÃO PULAR):
- Fase 0 (Quick Win)
- Fase 1 (itens 1-3)
- Fase 2 (itens 4-5)
- Fase 3 (item 6 - Chunking)
- Fase 4 (item 7 - Embeddings)

## ⚡ Importante:
- Fase 5 (itens 8-9)
- Fase 7 (itens 11-12)

## 🎓 Avançado (pode deixar para depois):
- Fase 6 (item 10)

---

# 🗓️ Cronograma Sugerido

**Semana 1:**
- Fase 0 + Fase 1 (1-3)

**Semana 2:**
- Fase 2 (4-5) + Fase 3 (6)

**Semana 3:**
- Fase 4 (7) + Fase 5 (8-9)

**Semana 4:**
- Fase 7 (11-12) + Projeto Final

---

# 📚 Recursos Extras

## Comunidades (tirar dúvidas):
- [Discord AI Brasil](https://discord.gg/aidevsbrasil)
- [Reddit r/MachineLearning](https://www.reddit.com/r/MachineLearning/)
- [Qdrant Discord](https://discord.gg/qdrant)

## Ferramentas úteis:
- [Notebook LM](https://notebooklm.google.com/) - Para estudar papers
- [Obsidian](https://obsidian.md/) - Organizar estudos
- [Anki](https://apps.ankiweb.net/) - Flashcards de conceitos

## Datasets para praticar:
- [HuggingFace Datasets](https://huggingface.co/datasets)
- [Kaggle Datasets](https://www.kaggle.com/datasets)

---

# ✅ Checklist Final de Domínio

Você dominou RAG quando conseguir:

- [ ] Explicar como texto vira vetor (embedding)
- [ ] Implementar cosine similarity do zero
- [ ] Explicar por que HNSW é mais rápido que busca linear
- [ ] Escolher estratégia de chunking baseado no contexto
- [ ] Debugar por que seu RAG retornou resposta errada
- [ ] Avaliar qualidade do RAG com métricas objetivas
- [ ] Construir RAG do zero sem frameworks pesados

**Parabéns! 🎉 Você agora entende RAG profundamente.**