# HANDOFF · Método VS — prompt para a próxima sessão

> Cola isto no início de uma nova sessão (com Claude ou outra IA). É o resumo honesto
> de uma sessão longa e difícil, para NÃO se repetir o desgaste. Lê também o `CLAUDE.md`
> (secção "DECISÕES TRAVADAS" e "FOCO / HANDOFF") — é a fonte canónica.

---

## Quem és e o que é isto
Estás a ajudar a **Vivianne** (psicóloga: Transpessoal, Constelação Familiar, Psicologia
e Espiritualidade) a construir o **Método VS · Ver e Soltar** — um motor de conteúdo no
admin de uma app Next.js, para 4 contas de Instagram:
- **vivianne.dos.santos** (a mãe), **ver.soltar**, **vir.soltar**, **viver.soltar**.
Repo `vivnasc/viviannepag`. Branch de trabalho: `claude/calendar-weekly-linking-gf3s5l`
(PR #406, **draft, NÃO merged**). Deploy = preview Vercel a cada push.

## COMO TRABALHAR COM ELA (o que mais importa — aprendido à força)
- **Entrega, não questiones.** Ela NÃO decide coisas técnicas — decide tu o técnico e
  entrega feito. Pergunta só o que é genuinamente criativo/dela, e mesmo isso pouco.
- **Um passo de cada vez, fechado.** Nada de empilhar mudanças nem oscilar. Cada vez que
  mudas a mesma coisa duas vezes, tiras-lhe o chão e ela perde a confiança.
- **Não decidas "à tua maneira".** Segue o que ela já disse e o `CLAUDE.md`. Se não sabes,
  ESTUDA o repo/histórico antes de inventar.
- **Lê com crítica o que fazes.** Antes de dizer "está feito", verifica de verdade.
- **Limpeza é nos DOIS lados (código E frontend).** Zero botões/coisas mortas.
- **NUNCA mandes descansar. NUNCA faças merge sem ela pedir.** "Produção" para ela =
  ela produzir conteúdo no admin, não git merge.
- **Tom humano.** Ela investiu a alma nisto e esgotou-se. Sê direto, sem desculpas, sem
  floreados; assume erros teus de forma plana.

## LIMITE DO AMBIENTE (crítico)
No container de dev **NÃO há `ANTHROPIC_API_KEY` nem Supabase** → **não consegues testar
a geração**. Mudanças de prompt são "às cegas" até ela regenerar no app. Diz-lhe sempre:
para ver o resultado tem de **apagar + regenerar** (o "gerar" SALTA o que já existe;
"testar 1 dia" regenera o dia). Não finjas que validaste o que não podes correr.

## DECISÕES CANÓNICAS (não voltar a discutir — detalhe no CLAUDE.md)
1. Cada peça = **1 REEL** (vídeo 9:16): 1 cena/figura + texto em sequência. Não é
   carrossel de imagens. O "carrossel" no admin é só lupa dos momentos.
2. **1 imagem por reel** (nunca por slide).
3. Geração fiável = **campos/arrays nomeados** (padrão banda/heroi), nunca "dá-me N beats".
4. **Nada hardcoded** no conteúdo — tudo da API a partir das fontes dela (SABER,
   referencias, personagens, faces). Frases-exemplo no prompt = o modelo copia → fora.
5. **Carta "Sou Aquela"**: personagem FIXA (baralho); MENSAGEM gerada da carta-semente
   (varia); figura = carta de baralho a sério (moldura).
6. **Filhas = 1 post/dia às 14h** (O Espelho/Carta de renomear/Repara). Sem manhã (por
   agora). A mãe = 2/dia (carta 10h30 + não normalizes 16h).
7. **Capa = faca**; **CTA forte**.
8. **Carta de renomear = tipográfica** (sem Flux).
9. **Véu é DNA partilhado** pelas 4 contas (não há véu por conta). O que distingue as
   contas é **formato + voz + ângulo**.
10. **Calendário trimestral** = DNA (7 véus/dia) × espiral (a face avança por semana,
    13 sem) × tratamento por conta. **Plano da semana** = comum, esqueleto + estado real.

## FICHEIROS-CHAVE
- Geradores: `app/api/admin/metodo/gerar-mae`, `gerar-conta`, `imagem-uma`, `imagens`,
  `gerar-carta`.
- Motor de texto: `lib/metodo/storyboard-ia.ts` (campos nomeados: facas/volta, carta de
  renomear). Imagem: `lib/metodo/ia.ts` (`gerarFundoIA`, `promptCartaFigura`).
- Fontes: `lib/metodo/saber.ts`, `referencias.ts`, `veu-faces.ts`, `veus.ts`,
  `personagens.ts`, `baralho.ts` (sementes), `lentes.ts`, `universo.ts`, `contas.ts`,
  `formatos-conta.ts`.
- Admin: `app/admin/metodo/[conta]/page.tsx` (estúdio/pipeline), `mae-plano/page.tsx`
  (plano da semana, 4 contas), `calendario/page.tsx` (trimestral), `app/admin/layout.tsx`.
- Docs: `CLAUDE.md` (canónico), `UNIVERSO-VS.md`, `METODO-VS.md`, `CONTINUIDADE-VIDEOS.md`.

## O QUE ESTÁ FEITO (preview, por validar com geração real)
Motor + estúdio do método a funcionar: carta (mãe), não normalizes (mãe), O Espelho/
Carta de renomear/Repara (filhas, 14h), pipeline no modal, 1 imagem/reel, hashtags,
calendário trimestral e plano da semana. Tudo no PR #406 (não merged).

## PRÓXIMOS PASSOS (pela ordem)
1. **Validar a QUALIDADE** com ela: apagar 1 dia antigo → gerar 1 dia novo → ver carta,
   não normalizes, e os 3 formatos das filhas. Afinar a VOZ/profundidade nos prompts
   (`storyboard-ia.ts`) **peça a peça, sem a esgotar**.
2. **Imagens**: confirmar que a figura da carta sai como carta de baralho e que a cena
   dos reels encarna o texto; afinar `promptCartaFigura`/`gerarFundoIA` se preciso.
3. **Formato da MANHÃ das filhas** (ficou por definir — "um formato digno"). É decisão
   dela; propor com cuidado, não impor.
4. **Cá em Casa** (banda) por gerar/ver: `/admin/banda`, `app/api/admin/banda/gerar`,
   `BandaSlide.tsx`, `lib/banda/*`. Gerar UM e mostrar antes de produzir em série.
5. Só fazer **merge para produção quando ela pedir**.

## CUIDADOS TÉCNICOS
- Datas a partir de componentes LOCAIS, nunca `toISOString()` (recua um dia em PT).
- Nunca gerar para datas passadas (os geradores já filtram `>= hoje`).
- `npx tsc --noEmit` E `npm run build` limpos (apagar `.next/types` antes) ANTES de push.
- Juntar mudanças num só deploy quando possível; **unsubscribe** dos webhooks do PR após
  merge (ela odeia spam).
