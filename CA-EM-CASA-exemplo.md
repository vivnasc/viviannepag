# Cá em Casa — exemplo para ver (1 post)

Gerado à mão **no formato e nas regras do gerador atual** (`app/api/admin/banda/gerar/route.ts`):
capa = UMA ilustração (Flux) com o gancho por cima · slides de ensino em texto · lição
de fecho (amor e pertença) · CTA · legenda · hashtags. Sem travessões, PT europeu com
acentos, capa como cena concreta (nunca aforismo).

> Falta só o que precisa de runtime: a imagem Flux da capa e o save no Supabase.
> Isto serve para **veres o tom** antes de produzir em série. Tema escolhido da pool
> (`lib/banda/topicos.ts`): *"O telefonema da mãe que nunca acaba"*.

---

## Os slides (como aparecem no carrossel)

**Slide 1 — CAPA** (ilustração + gancho por cima)

> ### A mãe liga às oito, e o jantar arrefece no prato.

*(imagem: cena de cozinha à noite, mulher sentada de lado à mesa, telemóvel encostado
ao ouvido com uma mão, a outra pousada num prato tapado a arrefecer, luz quente de
candeeiro, janela escura, ombros ligeiramente descaídos; ternura, a sensação de uma
chamada que não acaba)*

**Slide 2 — Ensino**

> Atendes sempre. Mesmo cansada, mesmo a meio do jantar, mesmo quando já não tens nada para dar.

**Slide 3 — Ensino**

> Aprendeste cedo que estar disponível era a forma de seres boa filha.

**Slide 4 — Ensino**

> Mas amor não é estar sempre ligada. É estar inteira quando estás.

**Slide 5 — LIÇÃO** (fecho)

> ### Podes amar a tua mãe e, ainda assim, dizer "agora preciso de descansar". O limite não corta o fio, dá-lhe folga para durar.
>
> ↗ envia a quem atende sempre

---

## Legenda (Instagram)

A mãe liga às oito, e o jantar arrefece no prato.

Atendes sempre. Não porque tens energia, mas porque desligar parece trair. Aprendeste que estar disponível era a forma de seres boa filha.

Só que amar não é estar permanentemente ligada. É estar inteira quando estás, e saber recolher-te quando já não tens nada para dar.

Dizer "agora preciso de parar" não corta o vínculo. Honra-o, para que dure.

Guarda para o dia em que o telefone tocar tarde. E envia a quem também atende sempre.

Se te reconheceste, deixa um coração.

**Hashtags:** #limitescomamor #constelacaofamiliar #relacoesfamiliares #maesefilhas #culpa #autoconhecimento #psicologiatranspessoal #cuidardesi #vinculos #pertenca #saudeemocional #familias

---

## O mesmo, em JSON (o que o gerador devolveria, sem a imagem)

```json
{
  "titulo": "O telefonema sem fim",
  "capa": {
    "gancho": "A mãe liga às oito, e o jantar arrefece no prato.",
    "imagePrompt": "an intimate evening kitchen scene, a woman seated sideways at the table, a phone held to her ear with one hand, the other hand resting on a covered dinner plate going cold, warm lamplight, dark window behind, shoulders slightly slumped, seen from the side, tenderness, the feeling of a call that never ends"
  },
  "ensino": [
    "Atendes sempre. Mesmo cansada, mesmo a meio do jantar, mesmo quando já não tens nada para dar.",
    "Aprendeste cedo que estar disponível era a forma de seres boa filha.",
    "Mas amor não é estar sempre ligada. É estar inteira quando estás."
  ],
  "licao": "Podes amar a tua mãe e, ainda assim, dizer \"agora preciso de descansar\". O limite não corta o fio, dá-lhe folga para durar.",
  "cta": "↗ envia a quem atende sempre",
  "legenda": "A mãe liga às oito, e o jantar arrefece no prato.\n\nAtendes sempre. Não porque tens energia, mas porque desligar parece trair. Aprendeste que estar disponível era a forma de seres boa filha.\n\nSó que amar não é estar permanentemente ligada. É estar inteira quando estás, e saber recolher-te quando já não tens nada para dar.\n\nDizer \"agora preciso de parar\" não corta o vínculo. Honra-o, para que dure.\n\nGuarda para o dia em que o telefone tocar tarde. E envia a quem também atende sempre.\n\nSe te reconheceste, deixa um coração.",
  "hashtags": ["#limitescomamor","#constelacaofamiliar","#relacoesfamiliares","#maesefilhas","#culpa","#autoconhecimento","#psicologiatranspessoal","#cuidardesi","#vinculos","#pertenca","#saudeemocional","#familias"]
}
```

---

## Duas coisas a decidires (não mexo sem o teu ok)

1. **Que versão é o "Cá em Casa" verdadeiro hoje?** O código tem DUAS:
   - **Atual** (`banda/gerar`): capa ILUSTRADA (Flux) + ensino + lição. É a deste exemplo.
   - **Legado** (`BandaSlide.tsx`, avatares Open Peeps Nina/Teresa/avó Alice/Rui/Tó com
     balões): marcado "legado" no componente. A tabela do `CLAUDE.md` ainda descreve esta
     ("cena COM personagens"), por isso o handoff e o código divergem.
2. Se aprovares o tom, gero a versão real (com imagem Flux + save) no teu ambiente, ou
   preparo um lote de N exemplos para escolheres.
