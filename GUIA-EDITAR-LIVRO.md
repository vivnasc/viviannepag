# Guia · Editar e publicar «A Grande Transição»

Este documento explica **toda a experiência** do livro: onde vive o texto, como se
edita, como funciona o design/formatação, e como se publica. É para estudares e
poderes terminar o manuscrito com autonomia.

---

## 1. O mapa — as três coisas (não se misturam)

| O quê | Onde | Para quê |
|---|---|---|
| **O TEXTO** (conteúdo) | `livro/A_Grande_Transicao_completo.md` + `livro/aparato.json` | as palavras do livro |
| **A FORMA** (design) | `build/livro-transicao.typ` + `livro/sistema.json` + `build/vendor/marca/*.svg` | como o livro fica na página |
| **A PUBLICAÇÃO** | GitHub Actions → PDF no bucket → landing/loja | pôr o livro à venda |

Princípio de ouro: **o conteúdo é separado da forma.** Escreves texto simples; o
motor (Typst) trata da beleza. Nunca metes formatação dentro do texto.

---

## 2. Editar o TEXTO (o mais importante)

### 2.1 A fonte que vai para o PDF
O que SAI no PDF vem de dois ficheiros no git:

- **`livro/A_Grande_Transicao_completo.md`** — o manuscrito inteiro. Os títulos
  seguem uma estrutura fixa que o motor lê:
  - `## PARTE I` / `### A humanidade da sobrevivência` (parte + o seu nome)
  - `### CAPÍTULO 1` / `#### A natureza que afinal era história` (capítulo + título)
  - `### INTERLÚDIO I`, `### EPÍLOGO`, `## PRÓLOGO`, `## INTRODUÇÃO`
  - o corpo são parágrafos normais, uma linha em branco entre eles.
- **`livro/aparato.json`** — por capítulo, os extras editoriais (não vão no corpo):
  `epigrafe`, `ideia` (a caixa «Hipótese»), `dica`, `pergunta` (a do olho),
  `destaque` (as frases fortes que aparecem a meio). A chave é o **título** do capítulo.

Depois de editares, corre `node scripts/livro-transicao/gerar-json.mjs` (ou deixa o
render fazê-lo) para gerar `livro/livro.json`, que é o que o Typst lê.

### 2.2 O estúdio de edição (com ajuda da Claude)
No admin: **`/admin/livro-transicao`** → cartão **«Ler e editar o texto»** →
**`/admin/livro-transicao/editar`**.
- Lês capítulo a capítulo; editas cada parágrafo à mão.
- Em cada parágrafo, **«pedir à Claude»**: escreves um comentário («mais seco»,
  «tira a repetição») e ela propõe a reescrita. Aceitas ou descartas.
- «guardar capítulo» grava à parte (Supabase), sem tocar no original.

⚠️ **Nota honesta:** hoje o estúdio serve para *rascunhar* com a Claude; as edições
ficam num overlay que ainda **não alimenta o PDF**. Para uma mudança entrar no
livro publicado, edita o `.md` (2.1). O passo «exportar edições → manuscrito»
está por ligar (posso ligá-lo quando quiseres, e aí o estúdio passa a mandar
direto para o PDF).

---

## 3. A FORMA (design e formatação)

Tudo em **`build/livro-transicao.typ`** (Typst). É um livro A5 (148×210 mm), papel
marfim quente, tipos **Fraunces** (serifa/display) + **Outfit** (sem serifa).
O que o motor faz sozinho a partir do texto:
- capa de imagem a sangrar, página de rosto tipográfica;
- **Parte** sozinha na sua página, com a imagem vertical na margem;
- **abertura de capítulo uniforme**: começa a meio, etiqueta + título + epígrafe + capitular;
- corpo que respira (espaço entre parágrafos), **quebras de movimento** (a fissura);
- **destaques** (as frases fortes) a meio dos capítulos;
- fecho de capítulo: caixa **Hipótese** + o **olho** sobre a **pergunta**;
- o **Mapa da Transição** e o colofão.

### 3.1 O sistema de símbolos (a linguagem visual)
- **`livro/sistema.json`** (e `sistema_en.json` para o inglês): cada tipo de bloco
  tem `{ rotulo, cor, moldura }`. Muda aqui o nome/cor/moldura e o livro inteiro
  acompanha. Molduras: `caixa` (Hipótese), `caixa-arquivo`, `nota` (a dica),
  `olho` (a pergunta), `aberta`.
- **`build/vendor/marca/*.svg`** — os teus desenhos: `fissura`, `emergencia`,
  `carta`, `transicao`, `olho`, `hipotese-no`, `arquivo-no`. Para trocar uma marca,
  substitui o SVG (mesmo nome). São os teus traços, não clipart.

### 3.2 Ver o resultado localmente (opcional)
```
typst compile --font-path build/fonts/static --root . \
  build/livro-transicao.typ A-GRANDE-TRANSICAO.pdf          # português
typst compile --input lang=en --font-path build/fonts/static --root . \
  build/livro-transicao.typ A-GRANDE-TRANSICAO-EN.pdf        # inglês
```

---

## 4. As IMAGENS (capa + 4 vinhetas das Partes)
No admin **`/admin/livro-transicao`**:
- **gerar** (Replicate/Flux) as imagens, ou **carregar a tua capa** (há um upload
  para **português** e outro para **inglês** — «The Great Transition»);
- os prompts das imagens estão em `lib/livro-transicao.ts`;
- ficam no bucket `viviannepag-assets/livro-transicao/`; o render vai buscá-las
  (`scripts/livro-transicao/baixar-imagens.mjs`) e mete-as no PDF.

---

## 5. PUBLICAR (o PDF que se vende)
1. No admin **`/admin/livro-transicao`** → **«renderizar PDF»**. Dispara o GitHub
   Actions (`.github/workflows/render-livro-transicao.yml`, motor Typst), que:
   gera o `livro.json`, baixa as imagens, compila **PT e EN**, e publica
   `produtos/a-grande-transicao.pdf` e `…-en.pdf` no bucket.
2. A **landing** (`/a-grande-transicao` e `/en/a-grande-transicao`) e a **loja**
   servem esse PDF; quem compra recebe-o.
3. Preço e ficha do produto: `app/api/admin/seed-produtos` (corre a rota de seed
   para sincronizar preço/estado). Hoje: **$27** (lançamento) / **$35**.

O ciclo curto: *edita o .md → renderizar → o site publica sozinho.*

---

## 6. A VOZ (as tuas regras, guardadas em código)
- **`lib/livro-voz.ts`** — a bíblia da voz + a lista de **tiques de IA a evitar**
  (abrir com «E/Mas», regra de três, «Não X mas Y», «talvez» a cada parágrafo,
  intensificadores vazios, metáforas infladas, etc.). É aplicada na **tradução** e
  na **edição assistida**.
- Regras fixas: português pré-AO90, **zero travessões** (— e –), sem auto-ajuda,
  sem nomear autores na frase, sem inventar biografia.

---

## 7. Links úteis
- Painel do livro: `/admin/livro-transicao`
- Estúdio de edição: `/admin/livro-transicao/editar`
- Landing: `/a-grande-transicao` · inglês `/en/a-grande-transicao`
- Documentação do Typst (o motor da forma): https://typst.app/docs/
- Referência da linguagem Typst: https://typst.app/docs/reference/
- Tipos de letra: Fraunces (https://fonts.google.com/specimen/Fraunces) ·
  Outfit (https://fonts.google.com/specimen/Outfit)

---

## 8. Para terminar o teu manuscrito — o caminho prático
1. Escreve/afina o texto em `livro/A_Grande_Transicao_completo.md` (segue a
   estrutura de títulos da secção 2.1).
2. Preenche o `aparato.json` de cada capítulo (epígrafe, hipótese, pergunta,
   destaques). Se não puseres destaques, o motor escolhe frases do teu próprio texto.
3. (Opcional) usa o estúdio `/admin/livro-transicao/editar` para lapidar parágrafos
   com a Claude.
4. Gera/carrega a capa e as imagens das Partes.
5. Carrega **renderizar** e vê o PDF final na landing.

Quando quiseres, ligo o «exportar edições → manuscrito» para o estúdio passar a
alimentar o PDF diretamente, e assim editas tudo pelo admin sem tocar em ficheiros.
