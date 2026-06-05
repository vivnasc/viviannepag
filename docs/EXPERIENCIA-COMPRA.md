# Experiência de Compra & Agradecimento — Vivianne dos Santos

Como está montada a compra de um produto e o cuidado pós-pagamento, para
**reutilizar noutros produtos e projetos**. Tudo gira à volta de: gentileza,
serif quente, dourado, e a pessoa nunca ficar sem saber o que se passa.

## O fluxo, do clique ao acesso

```
Página de compra  →  PayPal  →  /api/compra  →  email ao cliente (recibo+licença)
   (loja/[slug])                              →  email à Vivianne (notificação)
                                              →  grava em Supabase `compras`
        ↓ (após pagamento)
   /loja/sucesso  (página de agradecimento)
        ↓
   email de acesso com link de download  (/api/email-compra → /api/download-directo)
```

## Ficheiros (as ligações)

| Peça | Ficheiro |
|---|---|
| Página de compra (linda, detalhada) | `app/[locale]/loja/[slug]/page.tsx` |
| Catálogo / listagem | `app/[locale]/loja/page.tsx` |
| Botão de compra (PayPal) | `components/BotaoCompra.tsx` |
| Barra de compra mobile | `components/BarraCompraMobile.tsx` |
| Partilhar produto | `components/PartilhaProduto.tsx` |
| Checkout + emails | `app/api/compra/route.ts` |
| Página de agradecimento | `app/[locale]/loja/sucesso/page.tsx` |
| Email de acesso/download | `app/api/email-compra/route.ts` |
| Download do PDF (licença no rodapé) | `app/api/download-directo/route.ts` |

## Identidade da experiência (o que a faz gentil)

- **Tipografia:** serif (Georgia nos emails, Fraunces no site), itálico para a voz.
- **Cores:** dourado `#EBAE4A` (botões) sobre `#2A1C12`; terracota `#8C4A36`/`#9A5A43`;
  creme; cartão de licença em `#F3E4D6`.
- **Voz:** "Obrigada", "A tua travessia começa agora", "Guarda este email".
- **Confiança:** licença pessoal visível (`VS-XXXX`), contacto humano
  (WhatsApp `+258845243875`, `ola@viviannedossantos.com`), recibo que serve de licença.
- **Bilingue:** PT/EN em todo o lado (`isPt` / `lang==='en'`).

## Página de compra — anatomia (`loja/[slug]`)

1. **Voltar à loja** (link discreto).
2. **Capa do produto** + badge (ebook/guia/novo) no canto.
3. **Título** serif grande + **subtítulo** (a dor que resolve).
4. **Preço** com `preco_original` riscado + **poupança** (€ e %).
5. **Descrição** em markdown: tipo (PDF imediato), capítulos, e uma **citação**
   na voz da Vivianne (`> *...*`).
6. **Botão de compra** (PayPal) + **adicionar ao carrinho** + **partilhar**.
7. **Barra de compra fixa no mobile**.
- Conteúdo vem do Supabase `produtos`; há um **fallback** por slug no próprio
  ficheiro (título/subtítulo/descrição/preço/capa) para nunca ficar vazio.

## Página de agradecimento (`loja/sucesso`)

- Imagem `/gratidao-sucesso.png` num cartão arredondado com sombra.
- `obrigada` (tracking largo, dourado) → **"A tua travessia começa agora"**.
- "O pagamento foi confirmado. Vais receber um email com o acesso dentro de momentos."
- Gota assinatura + "voltar ao início".

## Email ao cliente (recibo + licença) — `api/compra`

Template HTML (Resend), pronto a copiar:

```html
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43;text-align:center">VIVIANNE DOS SANTOS</p>
  <h1 style="font-size:24px;font-weight:normal;text-align:center;margin:20px 0">Obrigada pela tua compra.</h1>
  <p style="font-size:16px;line-height:1.7;text-align:center;color:#6B5548">Compraste <strong>"TÍTULO"</strong></p>
  <!-- cartão de licença -->
  <div style="background:#F3E4D6;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9A5A43">LICENÇA DE USO PESSOAL</p>
    <p style="font-size:18px;font-family:monospace;font-weight:bold;letter-spacing:2px">VS-XXXX-XXXX</p>
    <p style="font-size:12px;color:#9A5A43">Registado para: email@cliente</p>
  </div>
  <!-- botão dourado -->
  <a href="LINK" style="display:inline-block;background:#EBAE4A;color:#2A1C12;text-decoration:none;padding:14px 36px;border-radius:12px">Aceder ao produto</a>
  <!-- contacto humano -->
  <p>ola@viviannedossantos.com · WhatsApp · viviannedossantos.com</p>
</div>
```

- Licença gerada: `VS-${base36(timestamp)}-${4 chars}`.
- Também notifica a Vivianne (`ola@viviannedossantos.com`) com tabela da venda.
- Grava em Supabase `compras` (email, slug, título, preço, paypal_order_id, licença).

## Email de acesso/download — `api/email-compra`

- "Obrigada pela tua compra." → **"Descarregar PDF"** (botão dourado) → guarda o email.
- Link: `/api/download-directo?slug=...&email=...[&lang=en]` (carimba a licença no rodapé do PDF com o email do comprador).

## Como reutilizar noutro produto (nesta loja)

**Nada a programar.** Adiciona o produto ao Supabase `produtos` (slug, título,
subtítulo, preço, capa, badge). A página `/loja/<slug>`, o checkout, os emails e
a página de sucesso funcionam automaticamente por slug.

## Como reutilizar noutro projeto/marca

Copia o padrão:
1. **Checkout** (`api/compra`): inserir venda + gerar licença + 2 emails (cliente + dona).
2. **Página de sucesso** gentil (imagem + "a tua travessia começa agora").
3. **Email de acesso** com botão dourado e link de download com licença.
4. Mantém a **identidade**: serif, dourado `#EBAE4A`, cartão de licença `#F3E4D6`,
   contacto humano (WhatsApp + email), voz gentil e bilingue.

Variáveis necessárias: `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, Supabase
(`produtos`, `compras`), e o `from` verificado no Resend.
