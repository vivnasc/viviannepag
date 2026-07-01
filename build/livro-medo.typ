// As Sete Faces do Medo — interior. Ritmo duotónico (Opção 1):
// corpo em páginas claras; preto reservado a EVENTOS (abertura de face, pergunta maior).
#let ouro   = rgb("#C6A150")   // ouro vivo — páginas pretas
#let ouroC  = rgb("#9C7328")   // ouro fundo — páginas claras
#let marfim = rgb("#ECE4D2")
#let creme  = rgb("#F3ECDA")
#let tinta  = rgb("#221E17")
#let fundo  = rgb("#0C0A07")
#let mutP   = rgb("#8A774B")    // rodapé sobre preto
#let mutC   = rgb("#9A855A")    // rodapé sobre creme

#set text(font: "EB Garamond", fill: tinta, size: 11pt, lang: "pt", region: "pt")
#set par(justify: true, leading: 0.82em, spacing: 0.9em)
#set page(
  width: 148mm, height: 210mm, fill: creme,
  margin: (inside: 20mm, outside: 17mm, top: 20mm, bottom: 18mm),
  header: none,
  footer: context {
    set text(fill: mutC, size: 7.5pt, tracking: 2.5pt)
    align(center)[#(str(counter(page).at(here()).first()) + "   ·   O ESPELHO")]
  },
)
#counter(page).update(14)

#let secao(t) = align(center, block(above: 0.4em, below: 1.6em,
  text(fill: ouroC, size: 8.5pt, tracking: 3pt)[#upper(t)]))
#let destaque(b) = align(center, block(inset: (x: 8mm, y: 5mm),
  text(font: "Cormorant", fill: ouroC, style: "italic", size: 20pt)[#b]))
#let sepL = align(center, block(above: 1.4em, below: 1.4em,
  image("medo-assets/sep-losango-claro.svg", width: 46mm)))
#let cap(l, r, cor) = grid(columns: (auto, 1fr), gutter: 2.5mm,
  text(font: "Cormorant", fill: cor, size: 40pt, baseline: 8pt)[#l],
  par(justify: true)[#r])

// ---------- EVENTO: abertura de face (preta) ----------
#page(fill: fundo, footer: context {
  set text(fill: mutP, size: 7.5pt, tracking: 2.5pt)
  align(center)[#(str(counter(page).at(here()).first()) + "   ·   O ESPELHO")]
})[
  #set text(fill: marfim)
  #align(center)[
    #v(15mm)
    #image("medo-assets/espelho-fracturado.svg", width: 15mm)
    #v(9mm)
    #text(fill: ouro, size: 9pt, tracking: 4pt)[CAPÍTULO UM]
    #v(7mm)
    #text(font: "Cormorant", fill: ouro, size: 44pt, weight: "medium")[O Espelho]
    #v(2mm)
    #line(length: 15mm, stroke: 0.6pt + ouro)
    #v(3mm)
    #text(fill: ouro, style: "italic", size: 13pt)[a primeira face do medo]
    #v(12mm)
  ]
  #cap("R", [epara no que fazes antes de dizeres que não. Há uma pausa. Um cálculo rápido, quase invisível, em que mede não o que queres, mas o que vai acontecer à outra pessoa, ao que ela vai pensar, ao lugar que ocupas aos olhos dela depois de teres dito que não. E muitas vezes, no fim desse cálculo, dizes que sim.], ouro)
]

// ---------- corpo (páginas claras) ----------
#secao[O que se protege]
Por baixo desse sim está a face mais antiga de todas, porque é a mais antiga na história da espécie. Durante quase toda a nossa existência, ser deixado de fora do grupo não era um desconforto social. Era uma sentença. Pertencer era viver, e ser rejeitado era, muito literalmente, começar a morrer.

#destaque[Não é exagero.\ É memória.]

O teu sistema nervoso não distingue bem a exclusão de uma conversa da exclusão da tribo. Para ele, ficar de fora continua a soar a perigo de vida, e responde com a mesma pressa com que responderia se te tivessem fechado a porta da caverna com a noite a cair. Vale a pena demorarmo-nos nisto, porque muda a forma como olhas para a tua própria sensibilidade.

#sepL

Quando compreendes isto, deixas de te achar fraca por te doerem coisas pequenas. Não és exagerada. És fiel a um alarme que te manteve viva durante milénios, e que ninguém desligou só porque agora vives numa cidade e o pior que a exclusão te faz é uma tarde triste.

// ---------- EVENTO: a pergunta que fica (preta) ----------
#page(fill: fundo, footer: none)[
  #set text(fill: marfim)
  #align(center + horizon)[
    #image("medo-assets/espelho-fracturado.svg", width: 11mm)
    #v(9mm)
    #text(fill: ouro, size: 8pt, tracking: 4pt)[A PERGUNTA QUE FICA]
    #v(9mm)
    #block(width: 82%)[
      #set par(justify: false, leading: 0.7em)
      #text(font: "Cormorant", fill: ouro, style: "italic", size: 26pt, hyphenate: false)[De quantos dos teus sim é que gostas mesmo, e quantos foram só a forma de continuares dentro da sala?]
    ]
  ]
]
