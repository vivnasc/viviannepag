# Migração do Pipeline Carrossel → repo `viviannepag`

**Origem:** `vivnasc/escola-veus` (este repo)
**Destino:** `viviannepag` (repo da página principal)
**Supabase:** novo projecto (preciso exportar)

Este playbook é o passo-a-passo. Tudo o que precisas está em `migration/`.
Para detalhe arquitectural completo, ver `docs/PIPELINE-CARROSSEL-COMPLETO.md`.

---

## 0. Pré-requisitos no repo destino

- Repo `viviannepag` é Next.js 15 (App Router)? Se não, fix isso primeiro.
- Tem Tailwind configurado com as cores `escola-*` (creme, dourado, terracota, etc.)?
  Se não, copia o `tailwind.config.ts` do escola-veus-app ou adapta.
- Tem `@supabase/supabase-js`, `@anthropic-ai/sdk`, `jszip` nas dependências?
  Se não, instala: `npm i @supabase/supabase-js @anthropic-ai/sdk jszip puppeteer`

## 1. Supabase novo

1. Cria projecto Supabase novo (https://supabase.com/dashboard/new)
2. Anota a URL e a `service_role` key
3. SQL Editor → corre `migration/files/supabase-schema.sql`
4. Storage → cria bucket `course-assets`, marca como **Public**
5. (Opcional) Migra coleções existentes via CSV — instruções no SQL

## 2. Ficheiros a copiar

Estrutura no destino (assume Next.js App Router em `src/`):

| De `escola-veus/` | Para `viviannepag/` |
|---|---|
| `escola-veus-app/src/lib/carousel-generate.ts` | `src/lib/carousel-generate.ts` |
| `escola-veus-app/src/lib/carousel-types.ts` | `src/lib/carousel-types.ts` |
| `escola-veus-app/src/lib/carousel-themes.ts` | `src/lib/carousel-themes.ts` |
| `escola-veus-app/src/lib/carousel-calendar.ts` | `src/lib/carousel-calendar.ts` |
| `escola-veus-app/src/lib/carrossel-veus-prompt.ts` | `src/lib/carrossel-veus-prompt.ts` |
| `escola-veus-app/src/lib/carousel-helpers.ts` | `src/lib/carousel-helpers.ts` |
| `escola-veus-app/src/lib/carousel-social/metricool-csv.ts` | `src/lib/carousel-social/metricool-csv.ts` |
| `escola-veus-app/src/lib/weekly-social/metricool-csv.ts` (header CSV partilhado) | `src/lib/weekly-social/metricool-csv.ts` |
| `escola-veus-app/src/lib/weekly-social/schedule.ts` (isoWeekToMonday) | `src/lib/weekly-social/schedule.ts` |
| `escola-veus-app/src/lib/video-poster.ts` | `src/lib/video-poster.ts` |
| `escola-veus-app/src/lib/supabase-server.ts` | `src/lib/supabase-server.ts` |
| `escola-veus-app/src/components/admin/CollectionWorkspace.tsx` | `src/components/admin/CollectionWorkspace.tsx` |
| `escola-veus-app/src/components/admin/CarouselEditor.tsx` | `src/components/admin/CarouselEditor.tsx` |
| `escola-veus-app/src/app/admin/producao/carrossel-veus/` (pasta inteira) | `src/app/admin/producao/carrossel-veus/` |
| `escola-veus-app/src/app/admin/producao/colecoes/` (pasta inteira) | `src/app/admin/producao/colecoes/` |
| `escola-veus-app/src/app/api/admin/carrossel-veus/` (pasta inteira) | `src/app/api/admin/carrossel-veus/` |
| `escola-veus-app/src/app/api/admin/colecoes/` (pasta inteira) | `src/app/api/admin/colecoes/` |
| `carrossel-veus/` (pasta inteira na raiz) | `carrossel-veus/` (na raiz do destino) |
| `.github/workflows/render-carrossel-veus.yml` | `.github/workflows/render-carrossel-veus.yml` |
| `docs/IDENTIDADE-VISUAL-CARROSSEL.md` | `docs/IDENTIDADE-VISUAL-CARROSSEL.md` |
| `docs/PIPELINE-CARROSSEL-COMPLETO.md` | `docs/PIPELINE-CARROSSEL-COMPLETO.md` |
| `migration/files/products.example.json` (renomear para `products.json`) | `src/data/products.json` |

## 3. Adaptações de código no destino

### 3.1 SYSTEM_PROMPT lê produtos do JSON (em vez de hardcoded)

Em `src/lib/carousel-generate.ts`, no topo do ficheiro:

```ts
import products from "@/data/products.json";

function buildEcossistemaSection(): string {
  return products.products.map((p) => {
    const lines = [`- ${p.icone} ${p.nome} · ${p.tipo}`];
    if (p.descricao) lines.push(`  ${p.descricao}`);
    if (p.quandoUsar) lines.push(`  Usar quando: ${p.quandoUsar}`);
    if (p.regraDura) lines.push(`  REGRA DURA: ${p.regraDura}`);
    lines.push(`  URL: ${p.url}`);
    return lines.join("\n");
  }).join("\n\n");
}

const SYSTEM_PROMPT = `És a voz editorial de Vivianne dos Santos...

ECOSSISTEMA (recursos reais, escolhe o que melhor liga ao tema do dia):

${buildEcossistemaSection()}

REGRAS DE CTA:
[resto do prompt...]
`;
```

A secção ECOSSISTEMA hardcoded (linhas ~102-140 actuais) sai e fica
gerada do JSON. Para adicionar os 70 ebooks: editas `products.json`,
não tocas em código.

### 3.2 Imports relativos

Se o destino usa alias `@/*` para `src/*`, os imports não precisam mudar.
Caso contrário, ajusta os `@/lib/...` para os paths reais do destino.

### 3.3 Cores do Tailwind

O CarouselEditor e Slide.tsx usam classes como `bg-escola-card`,
`text-escola-creme`, `border-escola-dourado`. Garante que o `tailwind.config.ts`
do destino tem estas cores definidas. Copia do escola-veus se necessário.

## 4. Variáveis de ambiente

### 4.1 Vercel (Production + Preview)

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://NEW_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...    (service_role do projecto NOVO)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GITHUB_DISPATCH_TOKEN=ghp_...        (PAT com repo:write para disparar workflow)
GITHUB_REPO_OWNER=vivnasc            (ou o owner real do repo viviannepag)
GITHUB_REPO_NAME=viviannepag         (nome do repo destino)
GITHUB_DISPATCH_REF=main
ELEVENLABS_API_KEY=...               (opcional, só se quiseres vozes)
```

### 4.2 GitHub Secrets (no repo viviannepag)

Settings → Secrets and variables → Actions → New repository secret:

```
SUPABASE_URL=https://NEW_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

(O workflow corre `node tools/render-carrossel-veus/upload-result.mjs`
que precisa destas duas para fazer upload das MP4s e PNGs.)

## 5. GitHub Actions workflow

O ficheiro `.github/workflows/render-carrossel-veus.yml` já está pronto a usar.
Único ajuste: se mudaste o nome do bucket (default: `course-assets`), actualiza
no workflow E no upload-result.mjs.

Trigger do workflow: API route `render-submit` chama
`POST https://api.github.com/repos/{OWNER}/{REPO}/actions/workflows/render-carrossel-veus.yml/dispatches`

com o `GITHUB_DISPATCH_TOKEN`. Logo as env vars `GITHUB_REPO_OWNER` e
`GITHUB_REPO_NAME` precisam apontar ao repo destino.

## 6. Catálogo de 70+ ebooks

A parte mais delicada da migração: o SYSTEM_PROMPT actual conhece
~9 produtos. Para os 70+ ebooks:

**Opção A — Tudo no products.json**
- Editas o JSON, adicionas 70 entries
- O prompt fica muito grande (8K tokens facilmente)
- Cada chamada Claude leva o prompt todo

**Opção B — Top-N por relevância (recomendado para escalar)**
- Mantens 70+ no JSON
- Antes de chamar Claude, filtras os top 8-10 mais relevantes ao brief da semana
- Passas só esses na secção ECOSSISTEMA
- Implementação: pequeno step "match products to brief" que faz keyword
  matching ou usa embedding simples

Pratico já a Opção A com 9 produtos. Se for para 70+, Opção B torna-se
necessária. Posso implementar quando for a hora.

## 7. Bucket de carrosseis em produção

Quando primeira coleção for renderizada no destino:
1. Cria-se automaticamente `course-assets/render-jobs/`
2. Cria-se `course-assets/carrossel-veus/<jobId>/{videos,pngs}/`
3. Cria-se `course-assets/carrossel-packages/` (para Metricool ZIP)

Não precisas criar estes folders manualmente — aparecem ao primeiro upload.

## 8. Checklist de validação

Depois de copiar tudo + configurar env vars:

- [ ] Visita `/admin/producao/colecoes/calendario` no novo deploy
- [ ] Clica "✦ Gerar com Claude" numa semana
- [ ] Verifica que cria coleção e abre o editor
- [ ] Edita um slide, vê preview com paleta correcta
- [ ] (Opcional) Arrastas imagem MJ para um fundo
- [ ] Clica "Gerar vídeos" — verifica que o GitHub Actions workflow dispara
- [ ] Aguarda render (~15 min) — MP4s devem aparecer em "Vídeos (versão actual)"
- [ ] Clica "📦 Pacote Metricool (ZIP)" — descarrega CSV

Se algum passo falha, ver os logs:
- Vercel: Functions logs (para API routes)
- GitHub Actions: Workflow runs (para render)
- Supabase: Logs (para erros de RLS ou storage)

## 9. O que não migrar

Estes ficam só em escola-veus (são específicos do website actual):
- Tudo de `hoje-em-mim/` (motion library separada)
- Tudo de `vc-sabia/` (frases diárias separadas)
- Tudo de `escola/` (frontend de cursos)
- Tudo de `marketing/`, `funil/`, `longos/`, `aulas/`
- Workflows não-carrossel
- Scripts em `tools/` que não sejam `render-carrossel-veus/`

---

## Caminho rápido (TL;DR)

1. Cria Supabase novo + corre `migration/files/supabase-schema.sql`
2. Copia os ficheiros listados na secção 2 para o repo destino
3. Edita `src/data/products.json` com os teus 70+ ebooks
4. Refactor `carousel-generate.ts` para ler do JSON (secção 3.1)
5. Configura env vars Vercel + GitHub Secrets (secção 4)
6. Deploy → testa em `/admin/producao/colecoes/calendario`

Quando estiveres pronto para começar, diz se queres que crie um ZIP
com todos os ficheiros prontos para drop-in.
