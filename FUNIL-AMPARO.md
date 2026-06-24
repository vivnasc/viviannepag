# Funil do Amparo — anúncio pago → romance grátis → biblioteca

A estratégia: pagar tráfego para o **Amparo, que é grátis**, capturar o email, e
deixar que o livro e uma sequência de cartas façam a venda dos outros 11 romances
(€12 cada). A isca é dar um romance inteiro de borla (muito mais forte do que
"compra o meu livro"); quem se emociona com o Amparo fica predisposto a pagar.

## O mapa do funil

```
Anúncio (Instagram/Facebook)
   ↓  (clica)
/amparo  → lê o capítulo 1 de graça (sem dar nada)
   ↓  (quer o resto)
deixa o email  → evento "Lead" (Meta Pixel)  → /api/romance-gratis
   ↓
email de entrega: o Amparo inteiro (pt+en)  [já existia]
   ↓  (sequência de cartas, novas leitoras só)
dia 4  · "A Amparo ficou contigo?"          (ligação, sem vender)
dia 9  · "conhece a Socorro"                (1.ª recomendação: As Travessas, €12)
dia 16 · "Sete estantes, sete perguntas"    (a biblioteca: qual delas és tu?)
dia 30 · "A vila fica aqui"                  (porta aberta, sem pressão)
   ↓
compra €12 na loja  → (evento "Purchase" — ver pendente abaixo)
```

## O que já está construído (nesta PR)

- **Sequência de cartas** (`lib/funil/sequencia.ts`) — 4 cartas em pt e en, escritas
  como cartas da Vivianne (sem barulho), cada uma com 1 link e o capítulo 1 grátis
  como reversão de risco.
- **Cron diário** (`/api/cron/funil-amparo`, 10h) que envia a carta devida a cada
  leitora por Resend. **Tudo opt-in e seguro** (ver "ligar").
- **Link de sair** em cada carta (`/api/funil-sair`) — funil_unsub, sem login.
- **Meta Pixel** no site (env `NEXT_PUBLIC_META_PIXEL_ID`) + evento **Lead** quando
  alguém deixa o email pelo Amparo.
- **Migração** `supabase-funil.sql` (colunas funil_step / funil_last_at / funil_unsub / locale).

## O que TU fazes para ligar (5 passos)

1. **Base de dados:** corre `supabase-funil.sql` no Supabase (SQL Editor). Acrescenta
   colunas, não mexe em dados.
2. **Variáveis no Vercel** (Settings → Environment Variables):
   - `NEXT_PUBLIC_META_PIXEL_ID` = o ID do teu Pixel (Meta Events Manager).
   - `FUNIL_SEQUENCIA_ATIVA` = `1` (liga o envio das cartas).
   - `FUNIL_DESDE` = a data de hoje, ex. `2026-06-23` (**só** apanha quem se
     inscrever a partir daqui — a tua lista atual NUNCA recebe a sequência).
   - opcionais: `CRON_SECRET` (protege o cron), `FUNIL_UNSUB_SECRET` (assina o link de sair).
   - (re-deploy para aplicar.)
3. **Meta Pixel:** cria o Pixel no Meta Events Manager, confirma que o `PageView`
   e o `Lead` aparecem (testa em /amparo a deixar um email teu).
4. **Anúncio:** Meta Ads Manager → objetivo **Leads/Conversões**, otimizar para o
   evento **Lead**, destino `https://viviannedossantos.com/amparo?utm_source=instagram`.
   Começa pequeno (€5–10/dia), 2–3 ângulos, deixa correr 4–5 dias antes de julgar.
5. **Vê os números** (ver "contas" abaixo) e corta o que não converte.

## Os ângulos do anúncio (testa 2–3 em paralelo)

Vende a **ferida**, não o "livro grátis". Imagem: uma das capas/cenas do Amparo
(mãos a segurar a casa) ou um reel teu. Texto sugerido:

- **A (a mãe que segura todos):**
  "Há trinta e seis anos que a Amparo apanha o filho antes de cada queda. Este é
  o ano em que aprende que as mãos também se pousam. Um romance inteiro, de graça,
  para quem carrega de mais. → lê o primeiro capítulo"

- **B (reconhecimento):**
  "Se és a pessoa a quem todos ligam quando precisam, e ninguém liga só para saber
  de ti, este livro é teu. Grátis. Lê o primeiro capítulo e vê se te reconheces."

- **C (a autora de dentro):**
  "Não escrevo de fora. Escrevo de dentro da mesma travessia. O meu primeiro
  romance, As Mãos de Amparo, é oferta — o livro inteiro, sem pedir nada. → começa a ler"

- **D (curiosidade/vila):**
  "Numa vila chamada Véspera, cada casa guarda a ferida de uma mulher. A primeira
  é a Amparo. O livro inteiro é grátis. Entra."

Regra de ouro: a primeira linha tem de parar o scroll com uma dor reconhecível.
CTA sempre suave ("lê o primeiro capítulo"), nunca "compra".

## As contas a vigiar (para saber se dá lucro)

| Métrica | Onde | Boa direção |
|---|---|---|
| Custo por lead (CPL) | Meta Ads Manager | quanto mais baixo melhor; com PDF a margem é ~100% |
| % que deixa email | leads ÷ cliques (Meta + /admin/lista) | landing /amparo já tem o capítulo 1 antes do gate |
| % que compra depois | vendas ÷ leads | é a sequência de cartas que move isto |
| ROAS | receita ÷ gasto no anúncio | > 1 paga-se; mira 1,5–3× com o tempo |
| Fonte das visitas | /admin/site-analytics | confirma que o tráfego do anúncio chega |

Com €12 por livro e margem quase total, mesmo conversões modestas pagam o anúncio
— mas tens de **medir**. Se o CPL for baixo e a sequência converter, escalas o orçamento.

## Pendente (melhorias a seguir, quando quiseres)

- **Evento `Purchase`** no checkout (para o Meta otimizar por compras e medir ROAS
  direto). Hoje só temos o `Lead`. É o próximo passo natural quando o `Lead` estiver
  a correr.
- **Conversões API (CAPI)** do Meta server-side (mais fiável que só o pixel).
- **Captura de `locale`** no gate para a sequência ir na língua certa (hoje cai em pt).

Nada disto envia um único email até pores `FUNIL_SEQUENCIA_ATIVA=1`. Revê as cartas
em `lib/funil/sequencia.ts` antes de ligar — são a tua voz, muda o que quiseres.
