# .preview-banda — pré-visualizar um "Cá em Casa" sem servidor

Ferramenta local de rascunho para a Vivianne **ver** um conto "Cá em Casa"
antes de o produzir a sério, quando não há servidor Next + Supabase +
`ANTHROPIC_API_KEY` à mão.

Não substitui o fluxo real (`/admin/banda` -> `/api/admin/banda/gerar`). Só
reproduz a lógica visual do `components/admin/BandaSlide.tsx` em SVG e
rasteriza para PNG, para inspeção rápida.

## Como usar

1. Edita `conto.json` (mesma forma que o gerador devolve: `titulo`, `paineis`
   com `cenario` + `personagens` [id/fala/modo] e o último painel só `licao`,
   mais `legenda` e `hashtags`). O conto segue as regras do SYSTEM prompt em
   `app/api/admin/banda/gerar/route.ts`.
2. `npm install --no-save @resvg/resvg-js` (rasterizador SVG, não fica no
   package.json).
3. `node render.js` -> escreve `png/painel-N.png`.

## Notas

- Fontes: usa substitutos do sistema (Liberation Serif/Sans, DejaVu Mono) em
  vez de Cormorant/Inter/JetBrains. Na app real o tipo de letra é mais fino.
- A paleta é a `synchim` (constelação familiar), igual ao gerador.
- Os PNGs estão no `.gitignore` (regeneráveis).
