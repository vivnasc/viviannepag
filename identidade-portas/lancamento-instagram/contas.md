# Contas de Instagram das tres portas · indice

Comecar do zero, uma conta por livro. Cada conta tem a sua branding (paleta e assinatura em `../<porta>/`), a sua voz e o seu motor proprio. O que as une e o nome da autora, nao um tema.

O MOTOR de conteudo das tres contas vive no codigo, no molde limpo da Soulab:
- `lib/portas/marca.ts` · as tres portas como marcas, cada uma com o SEU motor
  (as 7 faces / os 7 sinais / as tensoes), voz, paleta e regras de imagem.

O Metodo VS foi abolido: as contas ver/vir/viver saem do Publicar e sao
substituidas por estas tres (`lib/instagram/contas.ts`).

Nota sobre os @handle: nao consigo confirmar disponibilidade no Instagram daqui. Cada conta leva um recomendado e alternativas. Confirma antes de registar.

Foto de perfil: geras onde preferires. Deixo um prompt por conta, fiel a assinatura da porta (as versoes SVG foram abolidas).

---

## Como cada peca se estrutura (molde da Soulab)

Como na Soulab, cada porta tem ANGULOS de exploracao (os `tipos` em `lib/portas/marca.ts`); o gerador pega num angulo e produz uma peca (um reel 9:16: uma imagem simbolica + um fragmento de texto), com legenda e hashtags, e grava com `theme.marca` = id da porta, aparecendo no Publicar.

O que muda de porta para porta e a VOZ, a paleta, a assinatura visual e o motor:
- **Faces do Medo:** as 7 faces (o medo por baixo de um comportamento quotidiano, nunca nomeado; termina na fissura). Reconhecimento sem envergonhar.
- **Sinais de Desencaixe:** os 7 sinais (o Limiar; nunca ilustrar literalmente; transicao serena; fecho variado).
- **Grande Transicao:** as tensoes x dominios (nunca nomear a tensao; comeca numa cena de hoje; dois tempos na imagem; termina em reconhecimento).

Voz (das constituicoes): autoridade com calor, tocar a pessoa antes do sistema, portugues pre-AO90, sem travessoes, sem os tiques da lista de revisao (nao abrir com E/Mas, sem regra de tres, sem "nao X e Y", etc.).

---

## As tres contas

As 3 contas publicam em INGLES (decisao da Vivianne). Nomes, handles e bios em ingles; o conteudo sai em ingles nativo, escrito de raiz.

### The Seven Faces of Fear
- **Nome:** The Seven Faces of Fear
- **@handle:** `thesevenfacesoffear` (alt: `sevenfacesoffear` · `the7facesoffear`)
- **Pergunta:** what am I protecting?
- **Bio:**
```
The seven shapes fear wears so you will not recognise it as fear.
What are you protecting?
A door by Vivianne dos Santos
```
- **Prompt da foto de perfil:**
```
Extreme close-up of cracked black porcelain with a single seam of warm golden light glowing from inside the fracture, kintsugi, charcoal #0F0F10 background, minimal, centered, luxurious matte finish, fine grain, no text, no people, square
```

### The Signs of Not Belonging
- **Nome:** The Signs of Not Belonging
- **@handle:** `signsofnotbelonging` (alt: `signsofdisplacement` · `the7signs`)
- **Pergunta:** where is home now?
- **Bio:**
```
Still loving a place while you slowly stop living in it.
Where is home now?
A door by Vivianne dos Santos
```
- **Prompt da foto de perfil:**
```
A doorway ajar in a warm sunlit interior at late afternoon, soft golden light spilling across a wooden threshold, quiet domestic scene, warm palette #F4EFE8 #E8D5B5 #C7A96B, cinematic, minimal, centered, no text, no people, square
```

### The Great Transition
- **Nome:** The Great Transition
- **@handle:** `thegreattransition` (alt: `greattransition` · `the.great.transition`)
- **Pergunta:** what world is being born?
- **Bio:**
```
The future is already here, hidden in a kitchen of today.
What are you living that has no name yet?
A door by Vivianne dos Santos
```
- **Prompt da foto de perfil:**
```
A kitchen table at golden hour with an open handwritten notebook beside a softly glowing device, two eras in one still life, warm neutral palette #F5F1EA #E8DDCB #CDB79E, documentary realism, calm and lucid, no text, no people, square
```

---

## Estado do codigo

Ja feito:
- `lib/portas/marca.ts` · as tres portas como marcas no molde da Soulab (motor proprio de cada uma).
- `lib/instagram/contas.ts` · ver/vir/viver saem do Publicar, as tres portas entram.

A seguir (o estudio de geracao, como o `/admin/soulab`): o gerador por porta e as rotas/pagina de admin, para carregares em "gerar" e sair conteudo. So se testa com as chaves reais (ANTHROPIC + REPLICATE + Supabase), que nao existem no ambiente de desenvolvimento.
