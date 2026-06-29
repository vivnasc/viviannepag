# "Cena" / vídeo de cenas sequenciadas — como a sessão do anúncio o usa

Handoff para a sessão que produz o **anúncio do romance**. Explica como gerar o
vídeo de "cenas" (o `reel narrativo`) que já existe no repo. Não há nada a
construir de raiz: o pipeline está feito; é segui-lo.

## O que é (honestamente)

NÃO são cortes entre cenas diferentes. É **uma imagem trazida a movimento
cinematográfico contínuo** (~40s): gera-se um clip (Kling) a partir da imagem,
tira-se o último frame, gera-se o clip seguinte a continuar dali, e colam-se
todos num só MP4 sem cortes. O efeito é um plano que avança e respira.

Para um anúncio com **cenas distintas**, encadeiam-se **várias peças** (uma por
cena), cada uma com a sua imagem de partida (ver "Várias cenas" no fim).

## Pré-requisito

A peça (linha em `carousel_collections`) tem de ter **imagem** no primeiro slide:
`dias[0].slides[0].imageUrl`. Sem imagem, o render recusa
(`a peça não tem imagem`). Gera a imagem primeiro (boa qualidade → melhor motion).

## Passos

1. Ter/criar a peça com a **imagem de partida** do anúncio.
2. Disparar o render:
   `POST /api/admin/metodo-vs/reel-narrativo-dispatch`
   body: `{ "slug": "<slug-da-peça>", "nClips": 4, "dur": 10 }`
   - `nClips`: 2 a 8 clips (default 4). Mais clips = vídeo mais longo e mais caro.
   - `dur`: 5 ou 10 segundos por clip (default 10). 4×10 ≈ 40s.
3. Corre no GitHub Actions (`render-reel-narrativo.yml`), ~minutos.
4. Resultado: o MP4 contínuo fica em `theme.soulab.clipUrl` (e em
   `theme.reelNarrativo`); `dias[0].videoUrl` é posto a `null`.
5. **Re-renderizar normalmente** (o render de sempre, `render-dispatch`) para pôr
   o **texto por cima** do vídeo contínuo. Sem este passo, fica só o vídeo de fundo.

## Env necessária (GitHub Actions secrets)

`SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `VIVIANNEPAG_SUPABASE_SERVICE_ROLE_KEY`,
`REPLICATE_API_TOKEN` (o token do Replicate tem de estar no secret do Actions).

## Custo

~`nClips` gerações Kling por vídeo (≈4 para 40s). É um formato **ocasional**, não
diário. O modelo é `kwaivgi/kling-v2.5-turbo-pro`.

## Ficheiros (para a sessão do anúncio inspecionar/afinar)

- Disparo: `app/api/admin/metodo-vs/reel-narrativo-dispatch/route.ts`
- Render: `scripts/render-reel-narrativo.js` (os BEATS de câmara estão aqui)
- Workflow: `.github/workflows/render-reel-narrativo.yml`

## Várias cenas (anúncio com storyboard)

Como cada peça = uma imagem continuada, para um anúncio com várias cenas
distintas: criar **uma peça por cena** (cada uma com a sua imagem), gerar o clip
de cada, e juntar os MP4 na ordem (concat ffmpeg) — ou encadear pelo último frame
de uma cena na imagem de partida da seguinte, como o script já faz dentro de uma
peça. Esse encadeamento entre peças ainda não está automatizado; é o passo a
construir se o anúncio precisar de cortes de cena reais.
