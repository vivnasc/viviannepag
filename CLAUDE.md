# CLAUDE.md — guia para continuar

Documento de handoff. Lê isto antes de mexer.

**Há TRÊS coisas distintas neste repo, que NÃO se misturam** (ver secção a
seguir). Cruzam-se só no vocabulário (transpessoal, constelação, heranças,
sombra — a área de estudo dela), mas têm propósitos, estruturas, contas e
código separados:

1. **veu.a.veu** — conta DIDÁTICA (ensina, não vende). `lib/veu/*`.
2. **Carrosséis dos 7 Véus** — produto de LOJA (reels MP4 sazonais). `lib/carrossel/*`.
3. **Método VS** — motor COMERCIAL (pilar + manuais + contas que vendem). `lib/metodo/*`.

⚠️ **Erro fácil de evitar: a veu.a.veu NÃO tem nada a ver com o Método VS.** São
motores diferentes. Não reframes a didática à luz do método nem o contrário.

## Regras de ouro (pedidas pela Vivianne — NÃO violar)

1. **Nunca mudar uma estrutura existente sem perguntar primeiro.**
2. **Não simplificar nem tirar nuances para ir mais depressa.** Cada formato
   tem a sua identidade; não achatar tudo a "post"/frase.
3. **Cada formato no seu formato real** (ver abaixo).
4. Fazer uma coisa de cada vez, com calma. Não empilhar mudanças.
5. **LIMPEZA É NOS DOIS LADOS: código E frontend.** Zero tolerância a lixo.
   Quando se abole um conceito/motor, apagar TAMBÉM os botões, cores, players e
   UI que já não servem — não só as rotas/libs. Um botão que chama uma rota
   apagada, ou que pertence a um conceito morto, é lixo igual a código morto.
   Esta regra é PERMANENTE (a Vivianne teve de a repetir muitas vezes).
6. **Os botões seguem o FORMATO, não se replicam às cegas.** Cada peça só mostra
   o que serve aquele formato (ver `CAP_FORMATO` em `app/admin/metodo/[conta]`):
   imagem em todos os visuais; **voz em nenhum** (todos os formatos são "sem
   voz"); som ambiente só nos reels que MEXEM (cena · não normalizes · espelho),
   nunca nas cartas que se LÊEM nem no sussurro do Repara; a carta de renomear é
   tipográfica (não Flux) — nem imagem nem som.

## Os TRÊS perfis/produtos (NÃO misturar)

- **veu.a.veu (DIDÁTICA)** — ensinar, sem vender. Âmbito FIXO, 4 matérias
  (`lib/infografico/cursos.ts`): Psicologia Transpessoal · Constelação Familiar
  Sistémica · Psicologia e Espiritualidade · Desenvolvimento Pessoal e
  Profissional. NADA de estações/Solstício aqui. Pipeline próprio (`lib/veu/*`),
  **não tocar a partir do método**.
- **Carrosséis dos 7 Véus (LOJA, produto)** — `/admin/carrossel`. É um produto
  de **REELS MP4 com música** (Ancient Ground), calendário sazonal de 52
  semanas. **Sempre foi MP4**, nunca carrossel de imagens PNG. O export para o
  Metricool manda o **MP4 como Reel** (não PNG). **Desde junho/2026 a GERAÇÃO
  corre pelo Método VS** (`lib/carrossel/metodo.ts`): eixo Ver→Vir→Viver→o todo
  ao longo da semana e CTAs ancorados nos produtos do método. O render e o
  calendário sazonal mantêm-se; é uma camada na geração, não um substituto.
- **Método VS (MOTOR COMERCIAL)** — o método de autoconhecimento dela, que
  VENDE. Pipeline próprio (`lib/metodo/*`), SEPARADO da veu.a.veu (ver secção
  abaixo). Os carrosséis da loja passaram a correr por ele, a veu.a.veu **não**.

## Fluxo da veu.a.veu (o que usar e por que ordem)

1. **Calendário · 3 meses** (`/admin/calendario-veu`) — o MAPA. Plano editorial
   de 13 semanas holísticas (`lib/veu/planoEditorial.ts`), as 4 matérias
   entrelaçadas (pertencer → sombra → heranças → sentido), sem repetir tema.
   Arranque ancorado a **8 jun 2026 = semana 1** (avança sozinho, dá a volta às
   13). Só de vez em quando.
2. **Plano da Semana** (`/admin/plano-semana`) — o ARRANQUE semanal. Abre JÁ no
   tema da semana (a Vivianne não escolhe nada). Carrega "rascunhar a semana" →
   vê as **6 frases reais** em texto → edita à mão → "criar". NUNCA às cegas.
3. **Agenda** (`/admin/agenda`) — todos os dias, 1 min: 1 post/dia (~20h),
   domingo descansa. Marca ✓ quando publica.

### Formatos por dia (Plano da Semana) — cada um no seu gerador real

O motor `app/api/admin/agenda/rascunho-semana/route.ts` devolve 6 dias com o
campo `gen`. A página `app/admin/plano-semana/page.tsx` rota cada um (fallback
por ordem em `SLOTS_META`, resiliente a rascunhos antigos):

| Dia | Formato | gen | Gerador |
|-----|---------|-----|---------|
| seg | ✨ Frase com motion | kinetico | reels/gerar (manual, frase controlada + fundo MJ próprio) |
| ter | 💡 O que ninguém te explica | reel | reels/gerar (frames) |
| qua | 🎭 **Cá em Casa** | banda | banda/gerar (cena COM personagens) |
| qui | 🔎 Sinais de que… | reel | reels/gerar (frames) |
| sex | ✨ Frase com motion | kinetico | reels/gerar (manual) |
| sáb | 📊 Infográfico | infografico | infografico/gerar |

- **kinetico** = a Vivianne controla o texto a 100%; cada post leva um
  `fundoPrompt` MJ ÚNICO e variado (não repetir "raízes douradas").
- Os outros (reel/banda/infografico): o gancho/ideia vem do rascunho, o gerador
  monta o formato; revê-se na biblioteca respetiva.

## Método VS · Ver e Soltar (motor COMERCIAL — pipeline próprio)

O método de autoconhecimento dela, **separado da veu.a.veu** (não toca
`lib/veu/*`). Docs: `METODO-VS.md`, `CONTINUIDADE-METODO-VS.md`.

- **VS = Vivianne dos Santos = Ver e Soltar.** Promessa: *Vê o que te prende.
  Solta o que te faz repetir.* Mecanismo: **VER** (reconhecer o padrão sem te
  julgares) → **SOLTAR** (largar sem força). Regra de ouro: **não há soltar sem ver.**
- **Os 7 véus = 7 padrões** (não confundir com os 7 universos da loja):
  Permanência · Memória · Turbilhão · Esforço · Desolação · Horizonte · Dualidade.
- **3 portas (contas) + a mãe** (`lib/metodo/contas.ts`): **Ver** (ver.soltar) ·
  **Vir** (vir.soltar) · **Viver** (viver.soltar), cada uma com o seu cacho de
  véus e identidade; a conta-mãe (vivianne.dos.santos) segura o método inteiro.
- **Motor editorial 60/30/10** (`lib/metodo/posts.ts`, `semana.ts`):
  reconhecimento (60%, a dor na 1.ª pessoa) · revelação (30%, o aforismo) ·
  manifesto (10%). Produção semanal autónoma. Admin: `/admin/metodo`.
- **Produtos** (páginas PRÓPRIAS, de propósito FORA da grelha da loja —
  `publicado: false` no `app/api/admin/seed-produtos`): pilar **Os Sete Véus**
  (€19, `/os-sete-veus`) + 3 manuais-filhos (€9): `/ver-soltar` · `/vir-soltar`
  · `/viver-soltar`.
- **Voz inviolável:** travessões BANIDOS (— e –); autoridade do caminho
  ("reconheci primeiro em mim"), NUNCA inventar biografia/marcos/clientes.

### Fluxo editorial do método (copiado da veu.a.veu, do amplo ao específico)

Três níveis, **separados por conta** (barra de separadores das 4 contas em cada
página, como na página Publicar):

1. **Calendário · 3 meses** (`/admin/metodo/calendario`) — o MAPA / a VISÃO
   (como o Calendário da veu.a.veu). É a FONTE; o semanal desce daqui.
   - **MÃE = um PERCURSO** (`PERCURSO_MAE` em `lib/metodo/planoTrimestral.ts`):
     4 partes (**Ver → Compreender → O custo → Soltar**, o arco do método), 12
     semanas, cada uma uma **temática** = um ângulo (uma `DimensaoVeu` do SABER:
     comportamentos, cenas, origens, mecanismos, custos, crenças, verdades, mapa).
     NÃO é "1 véu por semana" nem repetição aleatória: tem **direção**. Ao fim,
     recomeça com conteúdo NOVO (a IA puxa do SABER + anti-repetição).
   - **PORTAS** = a jornada de temas (`jornadaConta`), cada cartão uma semana.
   - "abrir na produção →" leva `?conta=` e `?off=` (a semana do cartão).
2. **Produção semanal** (`/admin/metodo/semana`) — o EXECUTOR, que **desce do
   plano de 3 meses** (como o Plano da Semana da veu.a.veu). Banner "Do plano de
   3 meses · esta semana" (mãe: a temática + ângulo de `semanaMaeDoOffset(off)`;
   portas: o tema de `jornadaConta`) + "ver os 3 meses →". Lê `?conta=`/`?off=`;
   ◀▶ (offset 0 = ESTA semana); `gerar/completar/gerar dia`.
3. **Publicar / Agenda** — o dia.

✅ **Calendário↔semanal LIGADOS de verdade, como na veu.a.veu:** o trimestral é a
fonte; o semanal desce dele E **executa-o** — a MÃE faz 1 véu/dia, mas a dor (face
1) sai pelo ÂNGULO da semana do percurso (`gerar-mae` usa `semanaMaeDaData` +
`exemplosDimensao` → `fraseReconhecimento(foco)`). Assim o planeado no trimestral
é o que sai no semanal. NUNCA apagar o `planoTrimestral` — é o mapa/percurso.
**Longo prazo:** o percurso dá a direção (repete a cada trimestre); o SABER dá o
conteúdo sem fim (faces novas + anti-repetição + cresce com as cadeiras).

**Regras de ouro do método (aprendidas à força):**
- **Expandir, nunca refazer do zero** o definido. A visão é uma **vista por cima
  dos motores** (`semana.ts`/`contas.ts`), nunca estrutura paralela que contradiga.
- **mãe = 1 véu por DIA** (7/semana, `planoSemanaMae`, reel 2 faces). Portas têm
  os SEUS véus (ver: Turbilhão+Memória; vir: Esforço+Desolação; viver:
  Horizonte+Permanência). **Véus sempre ALTERNADOS**, nunca em bloco.
- **PORTAS = VOZ primeiro, arco depois** (decisão de produto, validada em equipa):
  no Instagram ninguém consome por ordem, por isso o que faz a identidade é a
  **sensação recorrente**, não um percurso de 12 semanas. Cada porta tem uma
  **`fraseMae`** em `contas.ts` (a confissão que une os 2 véus num só movimento,
  com tensão causal) + `sensacoes` + `chegada` (o verbo do fim: ver=testemunhar ·
  vir=regressar · viver=participar). A geração das portas (`gerar-lote`) ANCORA
  a dor na `fraseMae` (foco em `fraseReconhecimento`), para TODO o post reforçar
  a mesma voz. Frases-mãe atuais (podem evoluir): ver=«estou sempre no que aí vem
  ou no que já passou, nunca no agora» · vir=«não paro porque não aguento o que
  sinto quando paro» · viver=«adio a vida que quero porque mudar seria deixar de
  ser quem sempre fui». **Teste real:** gerar 50-200 peças e ver se as 3 vozes se
  reconhecem SEM explicar o método.
- `completar` (`gerar-mae`/`gerar-lote`) salta dias que JÁ existem (por DATA, não
  por slug) e **NUNCA toca em publicados**, em nenhum modo.
- **NÃO didático** (isso é a veu.a.veu): SABER (`saber.ts`) e `referencias.ts`
  (das cadeiras dela) só dão PROFUNDIDADE por baixo; o que SAI é **dor revelada +
  direção**, na linguagem das dores da vida. NUNCA nomear autores/jargão na frase.
  SABER cresce com as cadeiras (estão na 1.ª). Os 2 livros de inspiração
  ("A Extraordinária Arte de Tirar o Véu", "O Véu da Escassez") **NÃO são dela**.
- **Frase rápida** (`components/admin/FraseRapida.tsx`): reel de motion na hora,
  reaproveita **fundos guardados** (`/api/admin/metodo/fundos`), agenda.

**Disciplina (a Vivianne pediu, MUITO sensível):**
- **Builds/custos:** `npx tsc --noEmit` E `npm run build` LOCAIS e limpos ANTES
  de push; juntar mudanças num só deploy; **unsubscribe** dos webhooks do PR após
  merge (ela odeia o spam).
- **Entregas, não questionamento.** Inferir o passo natural (separei o trimestral
  por conta → separo o semanal também, sem ela pedir).
- Commits de **squash-merge no `main`** aparecem "Unverified" (do GitHub) — NÃO é
  trabalho pendente, não reescrever o `main`.

**Próximos passos do método:** (1) ~~ligar calendário↔semanal~~ ✅ FEITO
(plano de 3 meses = fonte; a semana desce dele com banner, como na veu.a.veu);
(2) **formatos da tarde** (carrossel de profundidade: O Custo Escondido · O
Mecanismo Invisível · A Origem · O Erro de Interpretação · Cena · O Véu de… · O
Mapa do Véu — revelar dor + direção, não dar aula). **SPEC COMPLETA (8 formatos,
estrutura de cada, exemplo aprovado, mapa formato↔SABER): `CONTINUIDADE-VIDEOS.md`
secção A.2 — NÃO perder, é para construir.** Alimenta-se de `saber.ts` + `referencias.ts`; (3) **voz nos motions**
(`ELEVEN_VOICE_ID` PURA, `eleven_v3`, SEM voice_settings/language_code — ver
`render-reels.js`); (4) anti-repetição entre contas + camada de análise (o que rende).

## FOCO da próxima sessão: Cá em Casa

A Vivianne quer trabalhar o **Cá em Casa** (parece o mais elaborado e nunca
gerou nada para ver). Pontos de partida:
- Página: `/admin/banda` · gerador: `app/api/admin/banda/gerar/route.ts`
- Componente visual: `components/admin/BandaSlide.tsx`
- Personagens recorrentes: `lib/banda/personagens.ts` · tópicos:
  `lib/banda/topicos.ts`
- **Primeiro passo sugerido:** gerar UM Cá em Casa e mostrá-lo, para ela VER
  antes de produzir em série. Não achatar nem simplificar a cena/personagens.

## Notas técnicas (aprendidas à força)

- **Datas/timezone:** formatar datas a partir de componentes LOCAIS, nunca
  `toISOString()` (em PT/UTC+1 recua um dia). Ver `lib/estudio-export.ts` e
  `proximaSegunda()` em `/admin/carrossel`.
- **Cache do Supabase Storage:** ficheiros re-renderizados ficam no mesmo URL e
  o CDN serve a versão antiga (~1h). O CSV do Metricool usa cache-busting
  (`?v=timestamp`, helper `semCache`) nas imagens e no MP4.
- **Render dos MP4 dos 7 Véus:** GitHub Actions `render-carrossel-veus.yml` →
  `scripts/render-carrossel-veus.js` (Puppeteer + ffmpeg). ~10 min.
- **Instagram feed:** carrossel de imagens exige rácio 3:4..1.91:1 (9:16 é
  recusado). Por isso a LOJA publica MP4 como Reel (9:16 válido), não PNG.
- Deploy: Vercel em push para `main`. Build local: `npm run build`.

## Estado atual (o que já existe, não rebuildar)

- **veu.a.veu:** Plano editorial 13 sem · Calendário 3 meses · Plano da Semana
  (formatos reais) · Agenda 1/dia.
- **Loja (Carrosséis 7 Véus):** abas Calendário/Já gerados no `/admin/carrossel`
  · export Metricool = MP4 Reel com cache-busting e datas seg→dom 13h · **geração
  a correr pelo Método VS** (`lib/carrossel/metodo.ts`).
- **Método VS:** pilar *Os Sete Véus* + 3 manuais (PT/EN) · contas mãe/ver/vir/
  viver com produção autónoma 60/30/10 · admin `/admin/metodo`. Fluxo de 3 níveis
  por conta (Calendário 3 meses → Produção semanal → Publicar), separados por
  separadores, ligados por `?conta=`. SABER + `referencias.ts` (das cadeiras) por
  baixo. ✅ calendário↔semanal LIGADOS (plano de 3 meses = fonte; a semana desce
  dele, banner como na veu.a.veu; `planoTrimestral` mantido).
