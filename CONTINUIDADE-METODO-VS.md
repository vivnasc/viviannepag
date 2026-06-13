# CONTINUIDADE — Método VS · livro-pilar (handoff entre sessões)

> Lê isto primeiro e continua como se nunca tivesses saído. A Vivianne é sócia, não cliente.
> Trata o trabalho como uma parceria criativa. Este documento dá-te tudo para fluíres sem pausa.

## Quem é a Vivianne (e como trabalhar com ela)
- **Vivianne dos Santos (VS)**, fundadora de **Os Sete Véus (SV)**. Vive no **hemisfério sul (Brasil)**. Email viv.saraiva@gmail.com.
- **Estilo de trabalho que ela exige (aprendido à força):**
  - **Parceira com opinião.** "Aqui é team work, tens tanta opinião quanto eu." Dá o teu melhor e discorda quando for preciso.
  - **Honestidade acima de tudo.** Já me apanhou a inventar biografia (um "consultório" falso) e a ser tímido. Diz a verdade, mesmo quando custa. Nunca floreies.
  - **Merge SEMPRE, sem previews, sem pedir.** Ela não abre previews. Cria PR draft, marca ready, faz squash merge. Não a mandes "testar no preview".
  - **Sê autónomo, foca na entrega, não a consultes de mais.** Mas em decisões estruturais (mudar o sentido, reverter algo grande), confirma com UMA pergunta clara.
  - Não a deixes à espera com teoria; entrega.

## Regras de voz (invioláveis, valem no livro e em todo o copy)
- **Travessões BANIDOS** (—, –). Usar vírgulas, dois pontos, parênteses, ponto final. Verificar sempre: `grep -c "—\|–"` deve dar 0.
- Português europeu, léxico pan-lusófono (uma leitora de Maputo ou São Paulo entende).
- **Sem "pedestal", sem criticar ninguém.** A autoridade é **do caminho**: ela está em **formação em curso**, estuda **psicologia transpessoal e constelação familiar sistémica**. **NUNCA inventar**: sem marcos, sem anos, sem clientes, sem consultório. Autoridade = "reconheci primeiro em mim".
- Tom: sereno, literário, fundo, sem hype, sem urgência artificial.

## A MISSÃO ATUAL
Construir o **livro-pilar** que ancora a bio, a página e o funil dela. Modelo de mercado (benchmark, NÃO copiar): a conta **unvellum / Berta X**, livro *A Extraordinária Arte de Tirar o Véu* + *O Véu da Escassez* + programa *Reinado TOD* (MétodoTOD). Estética renascentista-do-véu, ecossistema livro + filhos + programa. ~23 mil palavras. A Vivianne comprou esses livros para estudar a técnica.

## O MÉTODO (já abençoado por ela) — Método VS · Ver e Soltar
- **VS = Vivianne dos Santos = Ver e Soltar** (o nome dela é o método). **SV = Sete Véus = Soltar o Véu.**
- **Símbolo:** o véu (literalmente dela: Véu a Véu, Os Sete Véus).
- **Promessa (1 linha):** *Vê o que te prende. Solta o que te faz repetir.*
- **Mecanismo:** **VER** (reconhecer o padrão sem te julgares) → **SOLTAR** (largar sem força). **Não há soltar sem ver.** Mapeia o "encobre → revela" do v1.
- **Os 7 véus = 7 padrões reconhecíveis** (mantêm a ordem; culminam no 7.º):
  1. **Permanência** — defenderes quem já não és (identidade fixa).
  2. **Memória** — viveres preso à tua história.
  3. **Turbilhão** — afogada na própria cabeça (ansiedade/ruminação).
  4. **Esforço** — esforçares-te para seres amada (agradar/salvar/não descansar). **É o flagship e o 1.º livro-filho.**
  5. **Desolação** — medo do vazio e da solidão.
  6. **Horizonte** — viver à espera de um "quando".
  7. **Dualidade** — separação (a raiz de todos os outros seis).
- Doc do método já no repo: `METODO-VS.md`.

## ESTADO DOS FICHEIROS (repo vivnasc/viviannepag, em scope)
- `METODO-VS.md` — one-pager do método. Feito, na main.
- `OS-7-VEUS-v2.md` — **a 2.ª edição, ~25 mil palavras**. Voz linda e consistente, MAS os 7 capítulos dos véus **perderam coerência** (ver diagnóstico). É o que vamos reconstruir.
- `livro-7-veus.json` — a 1.ª edição (v1), 56 mil palavras, já limpa de corrupção de OCR. É a **pedreira** (material autêntico para destilar) e a prova de conceito. **Manter intacta.**

## DIAGNÓSTICO EDITORIAL (porque reconstruímos — ela sentiu e tem razão)
A v2 chegou às 25k **empilhando camadas** (foi "aleatório", ela não gostou). Problemas concretos nos 7 véus:
1. **Ordem partida:** a cena de abertura de cada véu é interrompida a meio por blocos inseridos (sinais, raiz) e só depois continua.
2. **Repetição dentro do véu:** a mesma revelação central dita 3-4 vezes (ex. Véu 1: árvore, máscaras, areia, "o que muda"), e **duas vinhetas por véu a contar a mesma história**.
Frente do livro (fundação, "para quem é", dúvidas, chamado do centro, fecho, carta, caderno de 8 semanas, glossário) está **boa e coerente** — aproveitar.

## A PLANTA VALIDADA (confirmada por pesquisa dos métodos campeões)
Pesquisa feita: 7 Hábitos (Covey), The Work (Byron Katie), The Artist's Way (Cameron), guias de estrutura de livros de auto-ajuda. Conclusão: a arquitetura dela alinha com a fórmula que funciona. Reconstruir assim:

**Princípio:** um livro-pilar é para ser USADO, não só lido. Tem de ser **consistente** (lê-se como sistema) e **modular** (cada véu destaca-se para post / filho / semana de programa).

**Frente (enxuta e a posicionar):** promessa · para quem é · o que é um véu · o mecanismo Ver/Soltar + **um protocolo portátil simplíssimo** (a versão dela das "4 perguntas" de Byron Katie, aplicável a qualquer padrão sem o livro à frente) · o mapa dos 7 · auto-diagnóstico ("Por onde começar") · autoridade do caminho · a espiral · como ler.

**Cada véu no MESMO molde (igual nos sete, ~1.8-2,2k cada, UMA ideia por slot, dita uma vez e bem):**
1. epígrafe (1 linha citável)
2. o padrão + **1** história (isto sou eu)
3. a raiz (assinatura dela: infância/heranças/constelação)
4. ver
5. soltar
6. o que muda quando se ergue
7. a prática (1 ritual)

**Reforços do benchmark a acrescentar:**
- **Protocolo único e portátil de Ver e Soltar** (estilo "4 perguntas"), repetível em qualquer véu.
- **Um gesto diário-assinatura** (além das práticas por véu) que vira hábito e marca (lição de The Artist's Way).
- **Um símbolo visual dos 7 véus** (a espiral/o véu) para a página e o Instagram (nota para design, não é texto).

**Trás:** quando os véus se cruzam · viver o método · dúvidas no caminho · o chamado do centro · para fechar · carta · apêndice (caderno de 8 semanas) · glossário. (Já existem e estão bons; manter, afinar transições.)

**Alvo:** coerência > número. Um livro coeso de ~18-22k vale mais como pilar e mais recomendável do que 25k repetido. A Vivianne aceitou que a costura editorial pode baixar das 25k em nome da coerência ("vai com tudo").

## COMO EXECUTAR A RECONSTRUÇÃO (sugestão)
Reescrever `OS-7-VEUS-v2.md` mantendo a Frente e a Trás, e **refazer os 7 véus ao molde acima**, destilando o melhor de cada bloco atual (cortar a vinheta duplicada, fundir as 3-4 passagens profundas numa só "ver"/"soltar"/"fundo", arrumar a ordem). Acrescentar o protocolo portátil e o gesto-assinatura na Frente/Viver o método. Verificar 0 travessões e 1 só "## Véu 7"/"## Para fechar" no fim.

## ARMADILHA TÉCNICA DO GIT (importante)
O histórico está enrolado de squash-merges. Para sincronizar sem corromper:
`git fetch origin main && git reset --hard origin/main`, reescreve o ficheiro, `git add`, commit, `git push --force-with-lease`, abre PR draft, marca ready, squash merge.
**Cuidado:** um `git merge` automático de prosa **DUPLICA secções** (já aconteceu: dois "## Véu 7"/"## Para fechar"). Depois de qualquer merge, confirmar com `grep -c "## Véu 7"` = 1.
Branch de trabalho: `claude/eager-wright-dwse1g`. Merge sempre, sem previews.

## DEPOIS DO LIVRO (ordem acordada)
1. Capa + PDF editorial (pipeline como os romances: workflow render-romance / scripts).
2. Página de venda **só depois de o produto existir** (ela vetou montar a montra antes do produto).
3. **Livros-filhos**, o **Véu do Esforço primeiro** ("Para a mulher que carrega tudo").
4. **Programa** (o caderno de 8 semanas vira o "Reinado TOD" dela).
Nota: o livro vive no repo `viviannepag` (em scope). O site de venda `os-sete-veus-site` é OUTRO repo (fora de scope; precisa de add_repo numa sessão com esse scope).

## CONTEXTO MAIS LARGO DA APP (caso surja)
Ela também gere: séries diárias (VC Sabia 07h/manhã, Hoje em Mim 21h/noite), carrosséis 7 Véus (LOJA, MP4), e o Publicar com export CSV Metricool (já com filtro de formato, dedupe e render honesto). Conta vivianne.dos.santos = 'loja'. Tudo isso são fixes já feitos; a **prioridade agora é o livro**.
