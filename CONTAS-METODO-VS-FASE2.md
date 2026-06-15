# Método VS · Fase 2 (conversão): guardado para não se perder

> Estás na **Fase 1: crescer** (3 contas a nascer). A conversão (funil de DM,
> oferta, diagnóstico) fica para quando houver audiência. Este documento guarda
> as permissões que já tens e o plano, para retomar sem perder nada.

## Fase 1 (agora): crescer, não converter
- Prioridade: **alcance + engagement** (reconhecimento, "o véu de [personagem]",
  conto + lição, sinais de que…, carrossel de autoridade).
- **CTAs de fase 0:** "guarda", "partilha com quem precisa", "segue". NÃO usar
  ainda "comenta VER → DM" (não há a quem chegar).
- O funil de DM fica na gaveta, pronto a ligar (ver abaixo).

## Permissões Meta já concedidas (token das contas)
Confirmadas pela Vivianne (verificável em `/admin/instagram` → "ver permissões"):

```
pages_show_list, business_management, instagram_basic,
instagram_manage_comments, instagram_manage_insights,
instagram_content_publish, instagram_manage_messages,
pages_read_engagement, instagram_manage_upcoming_events,
instagram_creator_marketplace_discovery, instagram_manage_contents,
instagram_manage_engagement, public_profile
```

**Conclusão:** com `instagram_manage_comments` + `instagram_manage_messages` +
`instagram_manage_engagement`, o funil **comenta → DM é construível NATIVO** na
app (sem ManyChat). Não falta permissão; falta a maquinaria (abaixo) e, sobretudo,
falta **audiência** (por isso espera).

## Plano da Fase 2 (quando houver tração)
1. **Mudar os CTAs** dos posts: de "guarda/partilha" para
   *"comenta VER / VIR / VIVER e recebe o 1.º passo em DM"*.
2. **Funil nativo comenta → DM** (reusar a infra que já existe):
   - **Cron** (como os crons que já há, ex. renovar-token) que lê os comentários
     recentes das 3 contas (`instagram_manage_comments`).
   - Apanha a palavra (VER / VIR / VIVER) e envia **private reply** (DM) com o
     1.º passo grátis + link do manual (`instagram_manage_messages`).
   - Regras do IG: 1 resposta por comentário, dentro de 7 dias. Guardar os
     comentários já respondidos (dedupe).
   - Reusar `lib/instagram` (Graph v21) + `getIgCredenciais(conta)`.
   - **Interruptor por conta (default OFF):** só dispara quando a Vivianne ligar.
3. **Posts de conversão** (fase 2): oferta do manual (1x/semana) e diagnóstico
   *"qual é o teu véu?"* (lead → DM → manual €9 → pilar Os Sete Véus €19).
4. **Guião das DMs por porta** (a escrever): o 1.º passo grátis + convite ao
   manual, um por VER / VIR / VIVER.

## Gatilho para arrancar a Fase 2
Quando uma conta tiver **comentários regulares / alguma tração**. Aí: ligar os
CTAs de funil, escrever os guiões das DMs, e ligar o cron (interruptor ON).

## O que NÃO fazer agora
Não ligar o funil com contas a zero. É prematuro e não traz nada.
