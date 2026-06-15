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
  viver com produção autónoma 60/30/10 · admin `/admin/metodo`.
