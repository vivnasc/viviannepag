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
