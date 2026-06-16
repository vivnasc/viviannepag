# Continuidade — Posts do Método VS (incl. vídeo) + estado de hoje

Handoff para a próxima sessão fluir sem perder contexto. Lê isto antes de mexer.

> **FOCO da próxima sessão:** continuar a trabalhar os **posts** do Método VS — em
> especial os **posts da tarde** e os **tipos que ainda não fechámos**. O **vídeo é
> apenas UM tipo de post** (ver A.1), não o foco único. Há outros formatos por fechar.

Partes: **A)** os posts a trabalhar (A.1 vídeo · A.2 outros tipos por fechar) e
**B)** o que mudámos HOJE (estado atual, para não refazer).

## A.2) POSTS DA TARDE — biblioteca de formatos (o grande "por fechar")

**Insight central (decidido com a Vivianne):** manhã e tarde têm funções DIFERENTES.
A tarde NÃO deve competir com a manhã (nem ser "mais frases em motion") — deve
**aprofundar** o interesse que a manhã gera.

| | MANHÃ | TARDE |
|---|---|---|
| forma | 1 imagem + 1 frase + motion | **carrossel** |
| função | reconhecimento + **alcance** | **profundidade + autoridade + construção do método** |

### Biblioteca de FORMATOS da tarde (para gerar conteúdo infinito, sem ficar preso a frases soltas)
Cada formato tem uma ESTRUTURA fixa; o Claude gera dentro dela, por véu → infinito.
São carrosséis (vários slides). **Esta é a "biblioteca de formatos" a construir.**

1. **O MECANISMO INVISÍVEL** — explica como o véu funciona. Estrutura: comportamento observado → explicação inesperada → mecanismo do véu → consequência. Ex.: "Porque verificas o telefone tantas vezes?", "Porque pensas demais antes de dormir?", "Porque descansas e sentes culpa?".
2. **A ORIGEM** — de onde o padrão veio. Estrutura: comportamento atual → função protetora antiga → porque continua hoje. Ex.: "Porque te tornaste a pessoa forte", "Porque aprendeste a agradar", "Porque tens medo de falhar".
3. **O ERRO DE INTERPRETAÇÃO** — desmonta crenças. Estrutura: pensas que é X → na verdade é Y → explicação. Ex.: "Pensas que é preguiça", "…falta de disciplina", "…dependência".
4. **O CUSTO ESCONDIDO** — cria consciência. Estrutura: benefício aparente → custo invisível → preço pago. Ex.: "O custo de ser indispensável", "…de pensar em tudo", "…de viver para depois".
5. **O MAPA DO VÉU** — diagnóstico (dos mais fortes, replicável a QUALQUER véu). Estrutura: "Quando estás neste véu: pensas… / sentes… / fazes… / pagas…".
6. **CENA DO DIA-A-DIA** — reconhecimento profundo. Estrutura: cena concreta → comportamento → leitura do véu. Ex.: "A mensagem tinha três palavras. O filme que fizeste dela tinha vinte cenas." → explica o Turbilhão.
7. **MITO vs VERDADE** — autoridade. Estrutura: Mito ("Se pensares mais, resolves") vs Verdade ("Se te fundires com o pensamento, perdes clareza").
8. **O VÉU DE…** — alcance (identificação rápida). Ex.: "O Véu da Mulher Forte", "O Véu do Bom Filho", "O Véu da Salvadora", "O Véu da Perfeccionista".

> Implementação sugerida: tipo de post novo "carrossel-tarde" com um `formato` (1–8) +
> véu; o Claude preenche a estrutura do formato escolhido; render como carrossel.
> Reaproveitar o motor de imagem (par com o texto) e a memória anti-repetição.

---

## A.3) PRINCÍPIO A ESTENDER: conexão imagem↔texto em TODOS os geradores
A Vivianne quer que a **imagem nasça SEMPRE em par com o texto** (representa o estado
da frase), em **todos** os geradores — não só no método. É possível e é o caminho
natural para os **clips** (a cena que encarna o texto, depois animada). **Sem partir
o que já existe — incremental.**

Estado atual por gerador:
- ✅ **Séries diárias** (VC Sabia / Hoje em Mim): JÁ fazem (a imagem e o som nascem em
  par com a frase — `lib/series/*`, `mjPrompt`/`somPrompt`). É o modelo a seguir.
- ✅ **Método VS** (ver/vir/viver/mãe): agora faz — `gerarFundoIA(conta, evitar, apiKey, frase)`.
- 〰️ **veu.a.veu kinético**: fundo do **MidJourney próprio** dela (curado à mão) — já é
  "conexão", mas manual; decidir se passa a auto-par.
- ⬜ **A fazer/confirmar**: Cá em Casa (banda), Infográfico, reels editoriais
  ("O que ninguém te explica", "Sinais de que…", "Uma ideia de…") — passar o
  texto/gancho ao prompt da imagem.

**Como (não-quebrar):** generalizar o `gerarFundoIA` num **helper partilhado** —
"prompt de fundo em par com o texto" (recebe mundo/paleta + texto + lista `evitar`) —
e ligar cada gerador a ele **um a um, testando 1 e mostrando** antes de produzir.

---

## A.1) VÍDEO — um dos tipos de post (spec já decidida)

Objetivo: dar ao Método VS um formato de **vídeo curto** com voz e legenda (1 tipo de
post entre os vários), mantendo a identidade. Spec já **decidida** (não re-decidir, é para executar):

### Formato (decidido)
- **20–35s** por vídeo. **6–8 cenas de 3–5s**, movimento lento, atmosférico.
- **1 vídeo = 1 ideia** (nunca misturar temas).
- Estrutura: **gancho (0–3s) → curiosidade (3–10s) → desenvolvimento (10–25s) → fecho (25–35s)**.
- Cadência: **2/semana** — **A = reconhecimento** (a dor) · **B = revelação** (o aforismo). ~50 vídeos em 6 meses = identidade.
- O guião sai do CÂNONE existente: gancho+desenvolvimento ← dores/sintomas do véu
  (`lib/metodo/reels.ts`, `lib/metodo/veus.ts`); fecho ← sala/manifesto.

### Voz (decidido — regras invioláveis)
- **ElevenLabs, modelo v3**, **voz clonada** (env `ELEVEN_VOICE_ID`), voz **pura** (não alterar settings que mudem timbre/sotaque).
- **Gerar a voz toda de UMA SÓ VEZ, contínua.** NUNCA por partes/por cena — se for em partes, o **sotaque oscila** (garantido). A voz manda; o vídeo monta-se à volta dela.

### Legenda sincronizada (decidido)
- Legenda **palavra a palavra**, colada à voz, via **timestamps** do ElevenLabs
  (endpoint TTS `with-timestamps` OU `forced-alignment` sobre o áudio único — confirmar qual o v3 suporta).
- Os **cortes entre cenas E a legenda nascem desses timestamps** (não por adivinhação).
- Por baixo: ambiente/música (Ancient Ground); por cima: voz contínua + legenda sincronizada.

### Cenas / clips
- **Biblioteca reutilizável de ambientes simbólicos por conta** (gerados por IA),
  recombinados por vídeo. Custo: criar a biblioteca uma vez (~$10–34 p/ 4 contas), depois ~$0/vídeo.
- Mesma lógica de identidade das imagens (ver Parte B): paleta própria por conta + assinatura pintada.

### Motor seguinte (anotado): Remotion — "universos, não perfis"
- Princípio validado: **universos, não perfis.** Cada conta vive no SEU mundo (já
  codificado nas atmosferas das imagens): **ver** frio/névoa/azul-petróleo · **vir**
  quente/âmbar/analógico · **viver** claro/arejado/solar · **mãe** mistério preto/dourado/azul profundo.
- **Remotion** (vídeo programático em React) é o motor novo que faz estes mundos
  **mexerem** (em vez de imagens paradas): névoa a mover-se + chuva no vidro (ver),
  luz quente a respirar + grão analógico (vir), horizonte com parallax + vento nos
  campos (viver). Objetivo: **reconhecimento em 1s, sem ler o @**. É a fase a seguir
  (um motor próprio) — anotado para quando avançarmos os clips.

### Estado técnico da voz (IMPORTANTE)
- `ELEVENLABS_API_KEY` e `ELEVEN_VOICE_ID` **já existem nas envs**.
- HOJE o ElevenLabs no repo só faz **ambiente sonoro** (`sound-generation`, "no voices" — `lib/series/som.ts`).
- **A VOZ (TTS) ainda NÃO está ligada a nenhuma rota** — está montada à espera. É o primeiro elo a construir.

### Primeiro passo sugerido (seguindo a regra dela "gerar UM e mostrar")
- Construir o pipeline e fazer **UM vídeo de exemplo, fim a fim** (o guião do Turbilhão serve):
  cenas + voz contínua (v3) + legenda sincronizada + ambiente. Mostrar antes de produzir em série.
- Teste de qualidade dos clips ~$0,55 + cêntimos de TTS — **só com luz verde dela** (é sensível ao gasto).

---

## B) O QUE MUDÁMOS HOJE (Método VS) — estado atual, já em produção (`main`)

Tudo merged (PRs #306, #309, #311–#323). Resumo por área:

### PRINCÍPIO-CHAVE (validado pela Vivianne): imagem↔texto + identidade por paleta
- A imagem do post **nasce em PAR com a FRASE** (como nas séries VC Sabia / Hoje em Mim, que ela fez "juntos"): a imagem **encarna** o estado/metáfora da frase — não é fundo genérico. `gerarFundoIA(conta, evitar, apiKey, frase)` recebe a frase.
- **A frase manda o ASSUNTO; a conta dá a PALETA/luz/tratamento.** É daqui que vêm a identidade E a conexão imagem↔texto. (Se faltar conexão ou identidade, é por aqui que se resolve.)
- viver = **verde como paleta/identidade** (não vegetação-assunto). ver=azul, vir=âmbar, mãe=ouro/escuro com luz.

### Imagens — agora geradas por IA, variadas e com identidade
- **`lib/metodo/ia.ts` → `gerarFundoIA(conta, evitar, apiKey)`**: o **Claude escreve o prompt** de cada fundo (criativo, varia assunto/composição/luz) e **evita os assuntos já usados** (`evitar` = `assuntoCurto` dos `notaVisual` existentes). Substituiu a lista fixa `fundoDaConta` (que ficou só como FALLBACK sem API key).
- Usado em: `app/api/admin/metodo/imagens/route.ts` (lote), `imagem-uma/route.ts` ("outra imagem", evita também os assuntos dos posts vizinhos), `gerar/route.ts` (post único).
- **Assinatura visual inviolável** no brief (`FUNDO_REGRAS`): pintura fine-art renascentista, sfumato, intemporal, **NÃO foto/stock**, luminoso. **SEM ouro obrigatório** (era o que fazia tudo colidir) → cada conta tem a SUA cor.

### Identidade por conta (`lib/metodo/contas.ts` → `atmosfera.prompt` + `atmosfera.registos`)
- **ver** = azul-petróleo frio (ver a tempestade de longe).
- **vir** = âmbar/lareira (regresso, acolhimento).
- **mãe** = ouro/escuro **COM luz** (nunca quase-preto — a Vivianne reclamou da escuridão).
- **viver** = **luz de dia clara e presente** (a vida vivida agora; **NÃO vegetação/floresta** — foi a maior dor de cabeça, está resolvido).
- `registos` = rotação de luz/hora por post (madrugada→hora azul) para variar dentro da paleta.

### Texto — anti-repetição (conteúdo "infinito")
- `fraseReconhecimento(veu, apiKey, evitar)` recebe as frases já usadas e **não repete tema/palavras** (antes caía sempre no "quando emagrecer").
- `gerar-lote` gera a semana **sequencialmente** acumulando memória (lê frases anteriores da conta na BD + acumula as desta geração) → fim do QUI=SÁB iguais.
- `texto-novo/route.ts` + botão **"texto novo (mantém imagem)"** no `[conta]/page.tsx`: frase nova na voz da conta (mãe = Dualidade) **sem perder a imagem**.

### Conta MÃE
- **No menu** (`app/admin/layout.tsx` → `/admin/metodo/mae`).
- É o **pilar transversal**: percorre **TODOS os 7 véus intercalados** (`reelsDaConta('mae')` em round-robin, Dualidade à cabeça); revelações idem (`posts.ts`). NÃO duplica a semana mono-véu de uma porta.
- Publica em **@vivianne.dos.santos** (partilha com séries diárias + loja).

### Hora de publicação (`lib/metodo/agenda.ts` → `horaDoMetodo`)
- Portas (ver/vir/viver) = **11h**; **mãe = 17h** (a conta partilhada já tem 07h/13h/21h).
- Gravada na geração (`gerar`, `gerar-lote`); fallbacks em `publicar/page.tsx` (`horaDe`) e `cron/publicar-ig`.

### Capa do Reel
- `lib/instagram/publish.ts` aceita `coverUrl`; publicamos o reel com **`cover_url` = poster do último frame** (a frase completa), que o render já gera (`scripts/render-carrossel-veus.js`, guardado em `dias[0].imagens[0]`).
- Ligado em `cron/publicar-ig` e `ig/publicar-agora` ("publicar já"). `thumb_offset=6s` como fallback.
- **Metricool NÃO tem coluna de capa para Reels do IG** (limitação dele) — só funciona publicando pela app.

### Contraste do texto no slide
- Halo escuro na palavra de ouro em `components/admin/MetodoSlide.tsx` e `KineticSlide.tsx` (não desaparece sobre fundo do mesmo tom).

### Rate limit da Replicate (429) — resolvido
- A Replicate limita a **~6 pedidos/min, burst 1** (contas de gasto baixo; sobe com o gasto).
- `imagens/route.ts` gera **uma imagem de cada vez** (sequencial, sem `Promise.all`), `LIMITE=4`/pedido (cliente repete), backoff **12s** no 429.
- Os erros do Flux/Replicate **aparecem no ecrã** (ex.: `429 throttled`, `402 insufficient credit`) em vez de "0 geradas" mudo.

---

## C) Notas técnicas e abertos
- `ANTHROPIC_API_KEY` serve TEXTO **e** prompts de imagem.
- A capa (poster com texto) só existe **depois do render** (`dias[0].imagens[0]`).
- Replicate: se voltar a dar 429, é rate limit — esperar/gastar um pouco sobe o limite.
- Reels já publicados no Insta mantêm a capa antiga (o IG não troca retroativamente).

## D) Regras de ouro (da Vivianne — NÃO violar)
1. Não mudar estrutura existente sem perguntar.
2. Não simplificar/achatar nuances para ir mais depressa.
3. Uma coisa de cada vez, com calma.
4. **Auditar o próprio trabalho ANTES de entregar** (erros engolidos em silêncio custam-lhe muito).
5. Voz do método: travessões BANIDOS; português europeu; nunca inventar biografia.
6. É sensível ao **gasto** (Replicate/IA): não regenerar às cegas; preferir testar 1 e mostrar.

---

## PROMPT DE ARRANQUE (copiar/colar no início da próxima sessão)
> Lê o `CONTINUIDADE-VIDEOS.md` e o `CLAUDE.md` antes de tudo. Com base neles, faz-me
> um **PLANO DE TRABALHO sequenciado** para os posts do Método VS, para eu avançar sem
> me perder.
>
> Regras: uma coisa de cada vez; não partir o que já existe; testar 1 e mostrar antes
> de produzir; cuidado com o gasto (Replicate/IA); auditar antes de entregar.
>
> Organiza em **fases curtas, ordenadas por prioridade/valor**, cada fase com:
> objetivo · passos concretos · o que muda no código · "pronto quando". Cobre:
> 1) **Posts da tarde** — biblioteca de 8 formatos (carrossel, profundidade).
> 2) **Conexão imagem↔texto em TODOS os geradores** (helper partilhado, incremental).
> 3) **Vídeo** (1 tipo): pipeline voz ElevenLabs v3 contínua + legenda sincronizada;
>    depois **Remotion** (mundos que mexem).
>
> NÃO comeces a construir já: mostra-me primeiro o plano com a ORDEM proposta e o
> PRIMEIRO passo concreto, recomenda por onde começar, e espera o meu OK.

---

## MÃE · post da manhã em "2 FACES" (1 reel, motion) — DECIDIDO
- A **mãe** (transversal, 7 véus) dedica **1 véu a cada dia** da semana: Seg→Dom =
  Dualidade · Turbilhão · Memória · Esforço · Desolação · Horizonte · Permanência
  (uma volta semanal ao método). As **portas** ficam como estão (2 véus intercalados).
- Cada dia da mãe = **UM reel (motion), NÃO carrossel**, com **2 FACES** no mesmo MP4:
  - **face 1 = a dor** (reconhecimento, do SABER via IA + anti-repetição),
  - **face 2 = a revelação** (a viragem, do cânone `reels.ts`/`saber`),
  - cada face com a SUA imagem em par com o texto.
- Exemplo aprovado (Segunda · Dualidade): face 1 "Estou rodeada de gente e, mesmo
  assim, sinto-me só." → face 2 "Nunca, em momento nenhum, caminhaste sozinha."
- **Build (3 passos):** (1) plano da mãe (7 véus/7 dias, tipo 'duasfaces'); (2) geração
  das 2 faces + 2 imagens; (3) **render**: estender o kinético para 2 fases num só MP4
  (face1 escreve→segura→transição→face2 escreve→segura). Testar 1 (Dualidade) e mostrar.
