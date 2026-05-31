# Pipeline de Produção de Livros · viviannepag

Contexto para arrancar uma sessão nova focada em produzir/melhorar livros.

---

## TL;DR

Cada livro vive em `content/produtos/{slug}/{slug}.md`. O texto em markdown é convertido para PDF editorial A5 (nível Modo Caverna / FreeMe) por um GitHub Action que: faz parse do .md, vai buscar imagens MJ ao Supabase do mundo correspondente, distribui-as por capítulos sem repetir entre produtos, renderiza HTML com Puppeteer, faz upload em cascata para Supabase Storage. O cliente que compra recebe o PDF via `/api/download-directo` com rodapé "Licenciado para: {email}".

---

## 1 · Onde os livros vivem

```
content/produtos/
├── ebook-01-culpa/
│   ├── ebook-01-culpa.md       ← versão PT (renderizada)
│   └── ebook-01-culpa-en.md    ← versão EN (renderizada em paralelo se quiser)
├── ebook-02-herdaste/
│   └── ebook-02-herdaste.md
├── guia-01-meu/
│   └── guia-01-meu.md
... (15 produtos PT actuais)
```

Naming: `ebook-NN-tema` ou `guia-NN-tema`. O número serve para ordenação, o tema entra no slug. Slugs com `-en` são versão inglesa.

---

## 2 · Estrutura do markdown esperada

O parser (`scripts/render-ebook.js` → `parseEbook()`) lê estes campos:

```markdown
# Título do livro

**Subtítulo numa linha entre asteriscos duplos.**

*Por Vivianne dos Santos*
*Bio numa linha em itálico simples.*

---

*Este ebook é um material de autoconhecimento... (disclaimer em itálico)*

---

## 1. Primeiro capítulo

Texto corrido em parágrafos. **Negrito** funciona, *itálico* também.

Subsecções com `### Título`.

> Blockquotes ficam com border ouro à esquerda + itálico grande.

Listas com `-` ou `1.` ficam preservadas.

---

## 2. Segundo capítulo

...
```

**Importante:**
- Capítulos têm de começar por `## N. Título` (com número e ponto)
- `---` entre capítulos é separador visual (ornament `· · ·`)
- Drop cap automático no 1.º parágrafo de cada capítulo
- Mínimo de 8 capítulos é o sweet spot (o script suporta qualquer número)

---

## 3 · Como o PDF editorial é gerado

### Pipeline

```
Botão "📚 render TODOS" no admin
        ↓
POST /api/admin/produtos/render-ebook-dispatch  { slug:'ALL', mundo:'auto' }
        ↓
GitHub Action `render-ebook.yml` (Puppeteer + Chromium)
        ↓
scripts/render-ebook.js loops por todos os slugs
        ↓
Por cada slug:
  1. parseEbook(md)
  2. fetchImagensMundo(slugToMundo(slug))   ← imagens MJ do Supabase
  3. distribuirImagens(imagens, nChapters, slug)  ← lane única por slug
  4. buildHtml(ebook, capa, porCapitulo)
  5. Puppeteer.pdf(A5, margens 0)
  6. Upload cascata: escritos → viviannepag-assets/produtos
  7. UPDATE produtos.ficheiro_path na DB (se vazio)
        ↓
Polling no admin mostra "ver PDF" em cada card
```

### Ficheiros-chave

| Path | Função |
|---|---|
| `scripts/render-ebook.js` | Pipeline completo — todo o HTML/CSS editorial está aqui |
| `.github/workflows/render-ebook.yml` | Setup Chromium + corre o script |
| `app/api/admin/produtos/render-ebook-dispatch/route.ts` | Recebe `{ slug, slugs[], mundo }` e dispara o workflow |
| `app/api/admin/produtos/pdfs-list/route.ts` | Lista PDFs existentes (signed URLs ou public fallback) |
| `app/admin/produtos/page.tsx` | UI dos botões `📚 render TODOS` e `📖 PDF editorial` per-card |

### Inputs do workflow

- `slug`: slug único, ou `ALL` para todos (default `ALL`)
- `slugs`: lista CSV de slugs (override do `slug`)
- `mundo`: `freeme`/`infonte`/`synchim`/`escola`/`autora`/`auto` (default `auto`)

`auto` chama `slugToMundo(slug)` que mapeia por regex:
- `sonho|voz|mente|teu` → infonte
- `casal|perguntas` → synchim
- `quemes|sentido|escuro|presenca` → escola
- resto → freeme

---

## 4 · Estética editorial (CSS no script)

Tipografia:
- **Serif body:** Fraunces (Google Fonts), 300/400 weight
- **Sans accent:** Outfit (labels caps espaçados, `0.32em`)
- **Corpo:** 11pt, line-height 1.78, justificado com hyphens

Paleta (constante COLORS no script):
- `barro` `#8C4A36` (chapter headings)
- `barroEscuro` `#5A3D2E` (cover bg)
- `areia` `#F3E4D6` (cover text, openers)
- `creme` `#F1E8DD` (body bg)
- `salvia` `#7D8A6A` (labels metadata)
- `ouro` `#EBAE4A` (chapter numbers, blockquote border, opener accents)

Páginas do livro (por ordem):
1. **Capa** — foto MJ full-bleed + gradiente bottom + "VIVIANNE DOS SANTOS" top + título grande em areia + linha ouro
2. **Half-title** — só título centrado em creme com ornament `· · ·`
3. **Página da autora** — label "A autora" + nome + bio italic
4. **Disclaimer** — entre linhas finas salvia
5. **Sumário** — capítulos numerados em ouro tabular
6. Por cada capítulo:
   - **Opener** — imagem MJ full-bleed + número gigante "01" em ouro + "Capítulo" + título
   - **Corpo** — drop cap no 1.º ¶ (Fraunces 54pt), justificado, ornament `· · ·` em `---`
7. **Final** — "Para a leitora" + créditos

---

## 5 · Distribuição de imagens (sem repetir entre produtos)

Cada mundo tem ~84 imagens MJ em `estudio/{mundo}/dia-N/slide-N-...jpg` (geradas pela campanha social — ver `lib/estudio-conteudo.ts`).

A função `distribuirImagens(imagens, nChapters, slug)` usa **8 lanes determinísticas**:
- `lane = hashSlugLane(slug) % 8`
- A sequência desta lane são as imagens `[lane, lane+8, lane+16, ...]`
- Slugs diferentes caem em lanes diferentes → **0 overlap entre produtos do mesmo mundo** (até 8 produtos por mundo).

Capa = primeira imagem da lane. Capítulos = imagens 1..N.

---

## 6 · Entrega ao cliente (pós-compra)

```
Cliente paga → BotaoCompra.tsx aponta para
   /api/download-directo?slug=X&email=Y
        ↓
fetchPdf(slug) tenta em cascata:
   1. Supabase escritos/{produtos.ficheiro_path}
   2. Supabase viviannepag-assets/produtos/{slug}.pdf  ← onde o bulk render acaba
   3. Disco private-produtos/{slug}.pdf  (legacy fallback)
        ↓
Injecta "Licenciado para: {email}" no rodapé do PDF
        ↓
Stream com Content-Type: application/pdf + Content-Disposition attachment
```

Email pós-compra (`/api/email-compra`) usa **o mesmo URL** — coerência total. Sem signed URLs (links nunca expiram).

**Teste sem comprar:** botão `testar como cliente` em cada card no `/admin/produtos` bate no endpoint exacto que o cliente bate.

---

## 7 · Como adicionar um livro novo

1. Cria a pasta: `content/produtos/ebook-09-tema/`
2. Cria o `.md` dentro com a estrutura da secção 2 acima
3. Cria o registo no admin (`/admin/produtos` → `+ novo produto`):
   - **slug**: tem de bater certo com o nome da pasta (`ebook-09-tema`)
   - **titulo**: igual ao `#` do md (ou parecido)
   - **descricao**: usada na loja, não vai para o PDF
   - **ficheiro_path**: deixa em branco — o render preenche
4. Confirma que existem imagens MJ do mundo correspondente em Supabase Storage
   (se não, gera-as primeiro via `/admin/estudio` adicionando dias do mundo
   ao `CALENDARIO_30_DIAS` em `lib/estudio-conteudo.ts`)
5. Vai a `/admin/produtos` → carrega `📖 PDF editorial` no card do novo livro
6. Espera ~3min → carrega `ver PDF` para validar → carrega `testar como cliente`
7. Quando satisfeita, marca `publicado: true` no edit do produto

---

## 8 · Operações comuns

**Re-render só um livro:**
- Botão `📖 PDF editorial` no card do produto → escolhe mundo no prompt

**Re-render todos:**
- Botão `📚 render TODOS` no header de `/admin/produtos`

**Mudar a estética:**
- Edita CSS dentro de `scripts/render-ebook.js` → `buildHtml()`
- Commit/push → re-render via botão

**Mudar a mapping slug→mundo:**
- Edita `slugToMundo()` em `scripts/render-ebook.js` (~linha 156)
- Mantém em sync com `gerarLegendas()` em `app/admin/produtos/page.tsx`

**Adicionar mais imagens a um mundo:**
- Gera dias novos do mundo via `/admin/estudio` (vai criar `estudio/{mundo}/dia-N/...jpg`)
- Próximo render automaticamente apanha as novas

---

## 9 · Limitações conhecidas

- **Bucket privado:** o bucket `escritos` no Supabase tem `allowed_mime_types` que rejeita PDFs. Por isso o render cai automaticamente para `viviannepag-assets/produtos/` que é público (URL adivinhável). Para fechar: adicionar `application/pdf` aos allowed MIME types do bucket `escritos` (dashboard Supabase).
- **Sem watermark visual:** o "Licenciado para: {email}" é injectado como texto no footer, não é uma marca de água diagonal. Suficiente para identificar partilhas, não bloqueia distribuição.
- **EN renders:** o script lê PT por default. Para renderizar EN, ainda preciso de adaptar (passar slugs `*-en` ou criar workflow paralelo).

---

## 10 · Comandos úteis (terminal local)

```bash
# Render local de 1 livro (precisa .env.local com SUPABASE_SERVICE_ROLE_KEY)
SLUG=ebook-01-culpa MUNDO=freeme node scripts/render-ebook.js

# Render local de vários
SLUGS=ebook-01-culpa,guia-02-frases MUNDO=auto node scripts/render-ebook.js

# Render local de TODOS
SLUG=ALL MUNDO=auto node scripts/render-ebook.js
```

---

**Esta sessão produziu:** o script `render-ebook.js`, o workflow `render-ebook.yml`, o endpoint dispatch, a integração com `/admin/produtos`, e a cascata de delivery em `/api/download-directo`. Tudo isto está em main. A próxima sessão pode focar-se em **escrever** livros novos sem te preocupares com a infra.
