# CONTINUIDADE — a MÃE (crescer) + selo EN @viviannewrites

Handoff vivo desta linha de trabalho. **Ler isto antes de mexer.** Objetivo: não perder
contexto (a Vivianne cansou-se de mo lembrar — registar aqui é obrigatório).

## As contas
- **@vivianne.dos.santos** (PT) — conta-mãe. `contaDe` → `loja`.
- **@viviannewrites** (EN) — selo internacional, a mãe em inglês. IG business id
  **17841480220138511** (página "Sete Ecos"). `contaDe`: slugs `crescer-en-` → `viviannewrites`.
  Token liga-se em **/admin/instagram → 🕯️ viviannewrites** (troca por 60 dias, renova só).
- Conteúdos saem nas **2 línguas** (toggle PT/EN no /admin/crescer).

## Os livros (títulos EN corretos — confirmados pelas capas)
- A Grande Transição → **The Great Transition**
- As Sete Faces do Medo → **The Seven Faces of Fear**
- Os 7 Sinais de Desencaixe → **The 7 Signs of Misalignment**
- Os Sete Véus (Método VS · Ver e Soltar) → **The Seven Veils** ("See what holds you.
  Release what makes you repeat.")

## O que está CONSTRUÍDO e no ar
- **Editorial VDS** (reel + carrossel): título-faca à esquerda + régua + corpo; geometria
  OU imagem à direita; cabeçalho (marca) + etiqueta do tema. `lib/crescer/assinatura-reel.js`
  + `app/render-reel-mae/page.tsx`.
- **Geometria composta** (a biblioteca combinada, fina, com foco de luz, ouro #d8a85a):
  anéis+eixo+nós, órbita, vesica, constelação, eclipse, ondas. **Espirais SVG abolidas**
  (a foto de espiral entra, o desenho não). `geometriaVDS(tema, seed)`.
- **Banco de imagens por família** (`/admin/crescer/banco`): arrastar categoriza sozinho;
  o gerador escolhe por tema (cena inteira OU acento). `lib/crescer/imagens-mae.ts` +
  `banco-server.ts` + `/api/admin/crescer/banco`.
- **Micro-travessia** (a espinha = *A Grande Transição*): faca (ferida) → limiar → o que
  se abre → coletivo. Minera 2 veias (reconhecimento + visão). `lib/crescer/gerar-ia.ts`.
- **Bilingue PT/EN** + **formato EXCERTO** (citação fiel: manuscrito de papel OU quote
  sobre foto, "From <livro>"). Handle/etiqueta por língua.
- **Planeador** (`/admin/crescer/planeador`): semana × **3 slots/dia** (11h · 17h ·
  **23h noite·Brasil**), abas PT/EN, enche slots do "por agendar". Horas em
  `lib/crescer/planeador.ts`.
- **Núcleo de foto de livro** (compositor `sharp`, `lib/crescer/livro-foto.ts` +
  `/api/admin/crescer/livro-foto`): a página REAL composta sobre a cena com sombra+relight.
  **Base** — falta a versão IC-Light (ver roadmap).

## REGRAS (não violar)
- **Voz e valores fixos.** Missão = mostrar a VANTAGEM de evoluir; companheira, não púlpito;
  a Vivianne NÃO é "testemunha" performática e NÃO se vende a alma. (Isto NÃO proíbe clone
  de voz/lipsync — ver roadmap; foi erro meu classificá-lo como proibido.)
- **Texto real nas fotos = COMPOSIÇÃO, não geração.** Nenhum modelo preserva tipografia;
  a página são os pixels reais (tipografados do texto dela OU exportados do PDF), relit por
  IC-Light. Nunca deixar a IA repintar a página.
- **Sem travessões** (— –) no conteúdo. PT europeu / EN natural. Sem clichés de self-help.
- **Método VS intacto** (só se lê dele).
- **Registar continuidade aqui** sempre que algo avança (para não perder contexto).

## ROADMAP / PENDENTES (não esquecer)
1. **Foto editorial do livro (IC-Light).** tipografar página real do texto dela → warp de
   perspetiva → **IC-Light** (`zsxkib/ic-light-background`, Replicate) para relight na cena
   → 4:5 → banco. Cenas já dadas pela Vivianne (livro em branco na mesa/janela; livro no
   sofá) = banco de cenas de livro. **Decisão aberta:** tipografar do texto dela (autónomo)
   vs exportar páginas do PDF.
2. **VÍDEO com CLONE DE VOZ + LIPSYNC.** (PLANEADO — não esquecer.) A voz clonada dela
   (ElevenLabs, já existe `lib/metodo/voz.ts`/`gerarVoz`) + lipsync sobre um vídeo/figura.
   A explorar no Replicate: modelos de lipsync/vídeo falante. Falta a Vivianne dar o
   formato exato (quem "fala", que figura, onde entra).
3. **Ferramentas Replicate a aproveitar** (premium, várias contas):
   - **IC-Light** (relight/compor real) — foto de livro + produtos em cena.
   - **BiRefNet** (recorte perfeito, PNG transparente) — acentos botânicos limpos, isolar produtos.
   - **Upscale** (Clarity/Real-ESRGAN) — capas, produtos, arte → impressão/retina.
   - **MusicGen / Stable Audio** — drones/ambiente originais por tema (por baixo da voz).
   - **FLUX Kontext** — edição por instrução (luz/estação, objeto em cena).
   - **Ideogram** — imagem COM texto real (anúncios, cartazes de citação, capas).
   - NOTA: **imagem→vídeo JÁ se usa** (não é novidade — não voltar a propô-lo como inovador).
4. **Áudio/drones** por baixo dos reels (ligado à voz).

## Limite do ambiente
Sem **REPLICATE/ElevenLabs/Supabase keys no dev** → tudo o que é Replicate/voz/IC-Light
**só se vê em produção** (não dá para provar no dev). O motor (sharp, geometria, layout)
esse dá para verificar localmente.
