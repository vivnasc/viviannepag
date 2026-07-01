# Identidade do interior · As Sete Faces do Medo

Amostra da expressão editorial **própria** do livro (não imita A Grande Transição).

- **Paleta:** preto quente (#0C0A07), ouro (#C6A150), marfim (#ECE3CF) — a da capa.
- **Interior dramático** (páginas escuras, texto marfim), decisão da autora.
- **Tudo serifa** (distinto da Grande Transição, que mistura serifa + sem-serifa).
- **Glifos:** os 7 símbolos de `SETE-FACES-SVG/` (alinhados à capa) abrem cada face.
- **Separadores:** `SETE-FACES-SVG/separadores/` (losango, ponto, tripla, espiral, e um por face).
- Abertura de face: glifo a ouro + «Capítulo N» + **título a ouro** + «o medo de…» + capitular a ouro.
- Corpo: **texto corrido em marfim claro** (ouro só em título, capitular e destaques — evita fadiga a 200 páginas); secções em versaletes; separador nas quebras.
- Pé de página: «14 · O Espelho» (número + face), para navegação num livro atmosférico.
- Abertura usa o **espelho fracturado** (`espelho-fracturado.svg`, o reflexo que se parte) — mais icónico; o espelho clássico da capa fica para usos pequenos. Corresponde ao mystic/espelho da spec.

`interior-amostra.png` é a prova de conceito (render HTML). O livro final sai por
**Typst** à mesma escala, PT+EN. Nota técnica p/ o pipeline: as marcas usam
`currentColor`; no PDF Typst é preciso trocar `currentColor` → ouro (e → tinta em
usos claros) no passo de build, porque o `image()` do Typst não herda a cor do texto.

Nome canónico da autora: **Vivianne dos Santos**.

## Sistema de abertura das 7 faces
Cada face abre com: **glifo · «Capítulo N» · título (o símbolo) · subtítulo ordinal · capitular**.
O subtítulo ecoa o título do livro e marca a progressão; o nome do medo vai no cabeçalho.

| Cap | Título | Subtítulo | Cabeçalho (o medo) |
|-----|--------|-----------|--------------------|
| 1 | O Espelho | a primeira face do medo | A Rejeição |
| 2 | O Punho | a segunda face do medo | A Perda |
| 3 | O Inverno | a terceira face do medo | A Escassez |
| 4 | A Fortaleza | a quarta face do medo | A Incerteza |
| 5 | A Luz | a quinta face do medo | A Exposição |
| 6 | O Apagamento | a sexta face do medo | A Insignificância |
| 7 | O Abismo | a sétima face do medo, a raiz | A Separação |

## Ritmo do interior (decisão da autora · Opção 1)
O interior **não é todo preto** (fadiga a 200-300 pág., custo de impressão, e-readers).
O preto passa a **evento narrativo**; o corpo lê-se em páginas claras:
- **páginas creme** (#F3ECDA), tinta escura (#221E17) — corpo, leitura longa;
- **páginas pretas** (#0C0A07) reservadas a: **abertura de cada face**, **a pergunta que fica**, transições e início/fim do livro;
- ouro só em títulos, ícones, capitulares, destaques e separadores (ouro vivo #C6A150 no preto; ouro fundo #9C7328 no creme).
Sensação cinematográfica: entrar na caverna (face) · percorrer o território (corpo) · sair para a luz.

## Pipeline (Typst, real)
- Template: `build/livro-medo.typ` (A5, duotónico). Compila com Typst 0.13.
- Fontes próprias (distintas da Grande Transição): **Cormorant** (display) + **EB Garamond** (corpo), em `build/fonts-medo/`.
- Assets cozidos a ouro para o PDF em `build/medo-assets/` (o Typst não herda `currentColor`; baker troca `currentColor`→ouro a partir de `SETE-FACES-SVG/`).
- Amostra rendida: `livro_medo/design/interior-typst-*.png` + `amostra-medo.pdf`.
