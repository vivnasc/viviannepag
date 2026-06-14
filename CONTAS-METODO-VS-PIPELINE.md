# Pipeline das 3 contas · Método VS (o que foi construído)

Nota de continuidade. Pipeline **novo e separado** da veu.a.veu (que está no
mundo e serviu de molde, nunca foi tocada). Objetivo: abrir as 3 portas (Ver,
Vir, Viver) com reels que entram pela dor e fecham pela revelação.

## O que existe agora (esta sessão)

### Canon de conteúdo (`lib/metodo/`)
- `contas.ts` — as 3 contas: handle, movimento, símbolo (a margem / o colo /
  descalça), `fundoBase` (família das capas), bios PT+EN, CTA, manual, `marca`.
- `reels.ts` — 24 reels (8 por porta) garimpados dos manuais, fiéis ao texto,
  cada um com porta, sala, véu, `fundoCena` única e fonte (linha do manual).
  `DESTAQUE_POR_REEL` define as palavras a ouro. `fraseDoReel` = porta + sala.
- `abertura.ts` — o manifesto de cada conta (post de apresentação) e a
  `SEQUENCIA` de lançamento (manifesto + 6 reels, alternando os dois véus).
- `legenda.ts` — legenda (porta, sala, nomear o véu, CTA de comentário) +
  hashtags por véu. A porta VENDE (ao contrário da didática).
- `agenda.ts` — cadência seg/qua/sex às 20h, datas LOCAIS (nunca toISOString),
  com `agendarAbertura` e `agendarTodas` (escalona uma conta por semana).

### Admin (`app/admin/metodo/`)
- `/admin/metodo` — painel das 3 portas, contagem de gerados.
- `/admin/metodo/[conta]` — sequência de abertura + biblioteca, preview animado
  do cinético, legenda/fundo por reel, botão **gerar** (e gerar toda a abertura).
- Link no menu do admin: "Método VS · 3 portas".

### API (`app/api/admin/metodo/`)
- `gerar/route.ts` — pega num reel, monta o cinético (frase com motion) com
  fundo Flux próprio e música Ancient Ground, grava em `carousel_collections`
  com `theme.marca` da conta (slug estável `metodo-<reelId>`). Espelha o modo
  manual de `reels/gerar`, sem lhe tocar.
- `list/route.ts` — estado dos reels já gerados (vídeo pronto, agendado).

### Ligação ao existente (aditivo, sem alterar comportamento)
- `lib/instagram/contas.ts` — registadas 3 contas: `versoltar`, `virsoltar`,
  `viversoltar`. Assim aparecem em `/admin/publicar` e no export Metricool.

## O fluxo (ponta a ponta)
1. `/admin/metodo/<conta>` → **gerar** um reel (ou a abertura toda).
2. O gerador cria a coleção com a marca da conta + imagem de fundo.
3. `/admin/publicar` → filtra pela conta, agenda, **renderiza o MP4** (o
   workflow `render-carrossel-veus` é genérico, aceita qualquer slug) e
   **exporta o CSV** do Metricool (já com cache-busting e datas locais).

## Decisões a confirmar com a Vivianne
- **Forma do reel:** ficou cinético de um plano, com a porta a escrever-se
  primeiro e a sala a aterrar a ouro (typewriter cria o tempo porta→sala).
  Alternativa, se preferires depois de veres: dois planos (porta, depois sala).
- **Handles** das contas (ver.soltar / vir.soltar / viver.soltar) ainda por
  fechar conforme disponibilidade.
- **Paleta:** uso `autora` (acento dourado) como identidade do método. A
  estética real vem da imagem de fundo (indigo/beringela/ouro, família das capas).

## Inventário legível
Ver `INVENTARIO-REELS-METODO-VS.md` (as 24 frases porta→sala + reserva).
