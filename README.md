# viviannedossantos.com

Página pessoal de Vivianne dos Santos. Next.js (App Router), TypeScript, Tailwind, next-intl, Supabase.

## Estrutura

```
app/[locale]/         home, layout, globals
components/home/      Hero, Respira, Mundos, Sobre, Newsletter, Footer
components/icons/     SVGs reutilizáveis
content/escritos/     artigos em MDX
i18n/                 routing, request config (next-intl)
messages/             pt.json, en.json
public/               imagens, favicons
scripts/              utilitários (export subscritores, etc)
legacy/pagina-html/       versão HTML antiga, mantida como referência histórica
```

## Desenvolver

```bash
npm install
cp .env.example .env.local   # preencher Supabase em Fase 2
npm run dev
```

Abrir http://localhost:3000.

## Idioma

PT é o default, servido em `/`. EN serve em `/en`. O seletor PT/EN no canto superior direito troca via next-intl, com o estado a viver no URL (sem localStorage).

## Tokens

- Terra: `#2A1C12` (fundo)
- Creme: `#F2E8DC` (texto)
- Ocre: `#B8843D`
- Âmbar: `#EBAE4A`
- Bordeaux: `#8B2235` (acento SyncHim)
- Violeta/Lila: `#5A4A6A` / `#C9B6FA` (acento Véus)

Fontes via `next/font/google`: Fraunces (serif), Outfit (sans).

## Regra editorial

Sem travessões em texto. Vírgula, ponto, dois pontos ou parênteses.

Artigos: aprofundam o diagnóstico, param antes da solução. A solução vive nos produtos.

## Fases

1. Setup + porte da home (feito).
2. Newsletter no Supabase: tabela `subscritores`, rota `/api/subscrever`, RLS.
3. Escritos: lista, filtro por temática, página de artigo, bloco-ponte para produto.
4. Primeiro artigo publicado (`o-no`).
5. PWA (manifest + service worker), deploy final na Vercel.
trigger deploy
