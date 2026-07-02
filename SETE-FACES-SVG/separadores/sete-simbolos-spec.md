# Sistema de Símbolos: As Sete Faces do Medo

Biblioteca de ícones do universo, para livro, EPUB, PDF, impressão, site, app e audiovisual.
Ficheiro de especificação para produção no Claude Code.

Alinhado à capa publicada: The Seven Faces of Fear, Vivianne Saraiva.
Norma ortográfica: português europeu pós-AO90 (direção, projeto, exato). Mesma convenção do spec da Biblioteca Visual VDS, ajustável.
Regra tipográfica: sem travessões em nenhum comentário ou metadado.

---

## 1. Objetivo

Criar um alfabeto de sete símbolos próprios do universo, não ícones genéricos extraídos de capas geradas por IA. Cada face do medo tem um glifo reconhecível, coerente com os restantes, ao nível dos símbolos das casas de um universo de fantasia ou dos glifos do zodíaco.

A capa já fixou a estética de referência: dourado sobre fundo escuro, linha limpa, glifo por face. Esta biblioteca é a versão vetorial, limpa e reutilizável desses mesmos sete glifos, para todos os outros suportes.

Dois sistemas em paralelo, um funcional e outro emocional:

- editorial: minimalista, premium, linha limpa. Para ebook, PDF, capítulos, landing pages, impressão e a própria capa. É o registo já validado na secção 8.
- mystic: linguagem mais simbólica e cinematográfica. Para geração de imagem, vídeo, posters, reels e cartas.

O mesmo nome de ficheiro liga as duas versões: `editorial/espelho.svg` e `mystic/espelho.svg` são a mesma face, dois registos.

---

## 2. As sete faces

Ordem canónica, com o nome da capa em inglês e o significado. Este é o índice mestre do sistema.

1. O Espelho, The Mirror, a Rejeição
2. O Punho, The Grip, a Perda
3. O Inverno, The Winter, a Escassez
4. A Fortaleza, The Fortress, a Incerteza
5. A Luz, The Light, a Exposição
6. O Apagamento, The Erasure, a Insignificância
7. O Abismo, The Abyss, a Separação (a raiz)

---

## 3. Mapa de conceitos

Coluna editorial já resolvida e verificada na secção 8, alinhada aos glifos da capa. Coluna mystic é o brief para a segunda vaga.

| Face         | Editorial (na capa)          | Mystic                            |
| ------------ | ---------------------------- | --------------------------------- |
| O Espelho    | espelho de mão oval          | reflexo fragmentado               |
| O Punho      | punho cerrado                | fios a escapar entre os dedos     |
| O Inverno    | floco de neve de seis braços | árvore sem folhas                 |
| A Fortaleza  | torre com bandeira           | muralha vista de cima             |
| A Luz        | lanterna com partículas      | palco iluminado                   |
| O Apagamento | perfil a dissolver-se        | pegadas que terminam              |
| O Abismo     | espiral                      | duas margens ligadas por um fio   |

Notas de potencial: a espiral do Abismo e o reflexo fragmentado do Espelho são os candidatos mais fortes a assinatura visual do universo. Vale a pena investir mais tempo de desenho nesses dois na vaga mystic.

---

## 4. Princípios do sistema

1. Um símbolo por ficheiro. Nunca combinar duas faces no mesmo SVG.
2. Coerência absoluta entre os sete: mesma espessura de linha, mesmo raio de curvas, mesma densidade visual, mesma grelha base 100x100. Um leigo tem de perceber, a olho, que os sete pertencem à mesma família.
3. Cor herdada, não fixa. Os editoriais usam `currentColor`, para adotarem a cor do texto onde forem colocados (preto no PDF, dourado no site e na capa, branco sobre fundo escuro) sem editar o ficheiro.
4. Uma face, dois registos. O nome do ficheiro é o mesmo em `editorial/` e em `mystic/`.
5. Nomes previsíveis e sem acentos no sistema de ficheiros: `espelho`, `punho`, `inverno`, `fortaleza`, `luz`, `apagamento`, `abismo`.

---

## 5. Contrato técnico

Todos os ficheiros editoriais cumprem isto. É o que garante que os sete parecem irmãos.

- `viewBox="0 0 100 100"`, sem width nem height no svg raiz.
- `stroke="currentColor"` em todo o traço. Sem cores fixas.
- `stroke-width="4"` como espessura única do sistema.
- `stroke-linecap="round"` e `stroke-linejoin="round"` como assinatura.
- `fill="none"` nas linhas. `fill="currentColor"` só em pontos e massas sólidas intencionais.
- Comentário de cabeçalho: face, medo, registo, nota de animação. Sem acentos, sem travessões.
- Cada símbolo agrupado num `<g>` com `id` igual ao nome da face, para animação e para reuso via sprite.

Diferença face ao spec da Biblioteca VDS: ali a cor vinha de variáveis douradas, porque era decoração de marca. Aqui a cor é `currentColor`, porque estes glifos entram dentro de texto e capítulos e têm de herdar a cor à volta.

---

## 6. Estrutura de pastas

```
sete-simbolos/
│
├── editorial/
│   ├── espelho.svg
│   ├── punho.svg
│   ├── inverno.svg
│   ├── fortaleza.svg
│   ├── luz.svg
│   ├── apagamento.svg
│   └── abismo.svg
│
├── mystic/
│   ├── espelho.svg        (reflexo fragmentado)
│   ├── punho.svg          (fios a escapar entre os dedos)
│   ├── inverno.svg        (arvore sem folhas)
│   ├── fortaleza.svg      (muralha vista de cima)
│   ├── luz.svg            (palco iluminado)
│   ├── apagamento.svg     (pegadas que terminam)
│   └── abismo.svg         (duas margens ligadas por um fio)
│
├── sprite/
│   └── simbolos.svg       (os 7 editoriais como <symbol>, para web e app)
│
├── separadores/
│   ├── sep-ponto.svg
│   ├── sep-losango.svg
│   ├── sep-tripla.svg
│   ├── sep-espiral.svg
│   ├── sep-cap-espelho.svg
│   ├── sep-cap-punho.svg
│   ├── sep-cap-inverno.svg
│   ├── sep-cap-fortaleza.svg
│   ├── sep-cap-luz.svg
│   ├── sep-cap-apagamento.svg
│   └── sep-cap-abismo.svg
│
└── preview/
    └── index.html       (grelha dos simbolos e separadores para revisao)
```

O sprite permite usar qualquer símbolo em qualquer sítio com `<use href="sprite/simbolos.svg#espelho"/>`. Para EPUB, usar antes os ficheiros individuais da pasta `editorial/`, que é mais compatível.

---

## 7. Nota sobre os ficheiros antigos

Os primeiros SVG tinham os nomes trocados: o ficheiro chamado `punho` continha o espelho, o `inverno` continha o punho, o `espelho` continha o inverno, e havia uma cópia repetida do espelho. Além disso, quatro glifos estavam desalinhados da capa: o inverno era um asterisco e não um floco, a luz era uma lâmpada e não uma lanterna, o apagamento era um arco abstrato e não um perfil, e o abismo era um traço interrompido e não uma espiral. A secção 8 corrige tudo. Descartar os ficheiros antigos e usar só os desta secção.

---

## 8. Os sete SVG-base editoriais (verificados, alinhados à capa)

Conjunto canónico, já rasterizado e conferido em dourado sobre fundo escuro. O Claude Code usa exatamente estes. Refinamento fino é permitido, desde que mantenha o contrato da secção 5 e a leitura de cada glifo.

### editorial/espelho.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- espelho | rejeicao | editorial | espelho de mao oval | animar: brilho a atravessar o oval -->
  <g id="espelho" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="50" cy="38" rx="20" ry="24"/>
    <ellipse cx="50" cy="38" rx="12" ry="15"/>
    <line x1="50" y1="62" x2="50" y2="84"/>
    <line x1="43" y1="84" x2="57" y2="84"/>
  </g>
</svg>
```

### editorial/punho.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- punho | perda | editorial | punho cerrado | mystic: fios a escapar entre os dedos -->
  <g id="punho" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 50 L36 44 Q36 40 40 40 Q44 40 44 44 L44 50"/>
    <path d="M44 50 L44 42 Q44 38 48 38 Q52 38 52 42 L52 50"/>
    <path d="M52 50 L52 42 Q52 38 56 38 Q60 38 60 42 L60 50"/>
    <path d="M60 50 L60 44 Q60 40 64 40 Q68 40 68 44 L68 56"/>
    <path d="M36 50 L36 68 Q36 80 50 80 Q68 80 68 66 L68 56"/>
    <path d="M36 58 Q28 56 28 64 Q29 71 38 70"/>
  </g>
</svg>
```

### editorial/inverno.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- inverno | escassez | editorial | floco de neve de seis bracos -->
  <g id="inverno" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <g id="arm">
      <line x1="50" y1="50" x2="50" y2="16"/>
      <line x1="50" y1="26" x2="43" y2="19"/>
      <line x1="50" y1="26" x2="57" y2="19"/>
    </g>
    <use href="#arm" transform="rotate(60 50 50)"/>
    <use href="#arm" transform="rotate(120 50 50)"/>
    <use href="#arm" transform="rotate(180 50 50)"/>
    <use href="#arm" transform="rotate(240 50 50)"/>
    <use href="#arm" transform="rotate(300 50 50)"/>
  </g>
</svg>
```

### editorial/fortaleza.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- fortaleza | incerteza | editorial | torre com bandeira -->
  <g id="fortaleza" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 82 L36 42 L64 42 L64 82"/>
    <line x1="30" y1="82" x2="70" y2="82"/>
    <path d="M36 42 L36 34 L43 34 L43 42 M46 42 L46 34 L54 34 L54 42 M57 42 L57 34 L64 34 L64 42"/>
    <path d="M46 82 L46 60 Q50 55 54 60 L54 82"/>
    <line x1="50" y1="34" x2="50" y2="22"/>
    <path d="M50 22 L61 25 L50 29"/>
  </g>
</svg>
```

### editorial/luz.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- luz | exposicao | editorial | lanterna com particulas -->
  <g id="luz" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <line x1="50" y1="20" x2="50" y2="26"/>
    <path d="M42 34 Q50 26 58 34 L58 64 L42 64 Z"/>
    <line x1="42" y1="46" x2="58" y2="46"/>
    <line x1="37" y1="64" x2="63" y2="64"/>
  </g>
  <g fill="currentColor">
    <circle cx="30" cy="42" r="2"/>
    <circle cx="70" cy="42" r="2"/>
    <circle cx="28" cy="56" r="2"/>
    <circle cx="72" cy="56" r="2"/>
    <circle cx="34" cy="30" r="2"/>
    <circle cx="66" cy="30" r="2"/>
  </g>
</svg>
```

### editorial/apagamento.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- apagamento | insignificancia | editorial | perfil a dissolver-se -->
  <path id="apagamento" d="M56 80 L56 62 L62 60 L58 52 L64 48 L60 42 Q58 28 44 30 Q34 32 34 46 L34 80"
        fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="currentColor">
    <circle cx="30" cy="40" r="2.5"/>
    <circle cx="24" cy="50" r="2.5"/>
    <circle cx="28" cy="62" r="2.5"/>
    <circle cx="22" cy="72" r="2.5"/>
  </g>
</svg>
```

### editorial/abismo.svg

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- abismo | separacao | editorial | espiral -->
  <path id="abismo" d="M50 50 Q54 50 54 46 Q54 40 47 40 Q37 40 37 51 Q37 65 52 65 Q71 65 71 47 Q71 25 47 25 Q21 25 21 51"
        fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
</svg>
```

---

## 9. Separadores

Dois tipos, no mesmo sistema (currentColor, traço fino 1.6, cantos redondos). Universais para separar secções dentro de um capítulo. De capítulo para abrir cada uma das sete faces com o glifo respetivo.

### Universais (viewBox 0 0 240 40)

```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
  <!-- sep-ponto | separador universal -->
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <line x1="40" y1="20" x2="108" y2="20"/>
    <line x1="132" y1="20" x2="200" y2="20"/>
  </g>
  <circle cx="120" cy="20" r="2.6" fill="currentColor"/>
</svg>
```

```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
  <!-- sep-losango | separador universal -->
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" stroke-linejoin="round">
    <line x1="40" y1="20" x2="104" y2="20"/>
    <line x1="136" y1="20" x2="200" y2="20"/>
    <path d="M120 12 L128 20 L120 28 L112 20 Z"/>
  </g>
</svg>
```

```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
  <!-- sep-tripla | separador universal | dinkus -->
  <g fill="currentColor">
    <circle cx="108" cy="20" r="2.4"/>
    <circle cx="120" cy="20" r="2.4"/>
    <circle cx="132" cy="20" r="2.4"/>
  </g>
</svg>
```

```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
  <!-- sep-espiral | separador universal | assinatura, ecoa o abismo -->
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none">
    <line x1="40" y1="20" x2="100" y2="20"/>
    <line x1="140" y1="20" x2="200" y2="20"/>
    <path d="M120 20 Q123 20 123 17 Q123 13 118 13 Q111 13 111 20 Q111 29 121 29 Q133 29 133 17"/>
  </g>
</svg>
```

### De capítulo (viewBox 0 0 300 60)

Cada um é o mesmo template com o glifo editorial da face embebido, centrado, a 40 por cento de escala. O traço do glifo passa a 1.6 nessa escala, igualando as linhas laterais. Template:

```svg
<svg viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg">
  <!-- sep-cap-NOME | separador de capitulo -->
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <line x1="46" y1="30" x2="112" y2="30"/>
    <line x1="188" y1="30" x2="254" y2="30"/>
  </g>
  <g transform="translate(130,10) scale(0.4)">
    <!-- colar aqui o conteudo interno de editorial/NOME.svg, sem a tag svg exterior -->
  </g>
</svg>
```

Gerar os sete, um por face: espelho, punho, inverno, fortaleza, luz, apagamento, abismo.

Uso sugerido: o `sep-espiral` ou o `sep-ponto` como separador corrente de secções, e o `sep-cap-NOME` na página de abertura de cada capítulo, por baixo do título.

---

## 10. Prompt para o Claude Code

Colar no Claude Code, com este ficheiro no repositório.

> Lê a especificação em `sete-simbolos-spec.md`. Cria a estrutura de pastas exata da secção 6.
>
> Fase 1, editorial. Cria os sete ficheiros de `editorial/` exatamente com o código verificado da secção 8. Não os redesenhes: já estão conferidos e alinhados à capa. Só normaliza formatação.
>
> Fase 2, sprite. Gera `sprite/simbolos.svg` com os sete editoriais como elementos `<symbol>`, cada um com o id da face, reutilizáveis por `<use href="sprite/simbolos.svg#nome"/>`.
>
> Fase 3, mystic. Gera os sete ficheiros de `mystic/` seguindo os conceitos emocionais da secção 3, no mesmo sistema de grelha 100x100 e currentColor, mas com liberdade para maior riqueza simbólica. São o registo cinematográfico, não o funcional.
>
> Fase 4, separadores. Cria os onze ficheiros de `separadores/` com o código da secção 9. Os quatro universais são exatos. Os sete de capítulo saem do template, cada um com o conteúdo interno do glifo editorial da face correspondente.
>
> Fase 5, revisão. Gera `preview/index.html` com os catorze símbolos (editorial e mystic lado a lado por face) e, por baixo, os onze separadores empilhados à largura toda, com o nome de cada um, sobre fundo escuro, para eu rever o sistema inteiro de uma vez.
>
> Não uses travessões. Não inventes faces novas: são exatamente as sete da secção 2.

Fim da especificação.
