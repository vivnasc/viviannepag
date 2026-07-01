// As Sete Faces do Medo — livro completo. Lê livro_medo/livro-medo.json.
// Ritmo duotónico: abertura de face preta · corpo creme · (eventos pretos).
#let livro = json("/livro_medo/livro-medo.json")

#let ouro   = rgb("#C6A150")   // ouro vivo — páginas pretas
#let ouroC  = rgb("#9C7328")   // ouro fundo — páginas claras
#let marfim = rgb("#ECE4D2")
#let creme  = rgb("#F3ECDA")
#let tinta  = rgb("#221E17")
#let fundo  = rgb("#0C0A07")
#let mutP   = rgb("#8A774B")
#let mutC   = rgb("#9A855A")

#let faceState = state("face", "")

#set text(font: "EB Garamond", fill: tinta, size: 11pt, lang: "pt", region: "pt")
#set par(justify: true, leading: 0.82em, spacing: 0.92em)
#set page(
  width: 148mm, height: 210mm, fill: creme,
  margin: (inside: 20mm, outside: 17mm, top: 20mm, bottom: 18mm),
  header: none,
  footer: context {
    let n = counter(page).at(here()).first()
    if n <= 1 { return }
    set text(fill: mutC, size: 7.5pt, tracking: 2.5pt)
    align(center)[#(str(n) + "   ·   " + upper(faceState.at(here())))]
  },
)

#let secao(t) = align(center, block(above: 1.2em, below: 1.5em,
  text(fill: ouroC, size: 8.5pt, tracking: 3pt)[#upper(t)]))
#let sepL = align(center, block(above: 1.3em, below: 1.3em,
  image("/build/medo-assets/sep-losango-claro.svg", width: 44mm)))
#let capitular(txt, cor) = {
  let cl = txt.clusters()
  grid(columns: (auto, 1fr), gutter: 2.5mm,
    text(font: "Cormorant", fill: cor, size: 40pt, baseline: 8pt)[#cl.first()],
    par(justify: true)[#cl.slice(1).join()])
}

// corpo de uma peça (páginas claras); capitular no 1.º parágrafo
#let corpo(blocos) = {
  let first = true
  for b in blocos {
    if b.t == "sec" { secao(b.texto) }
    else {
      if first { first = false; capitular(b.texto, ouroC) }
      else { par(justify: true)[#b.texto] }
    }
  }
}

// abertura de face (página preta)
#let abertura-face(p) = page(fill: fundo, footer: context {
  set text(fill: mutP, size: 7.5pt, tracking: 2.5pt)
  align(center)[#(str(counter(page).at(here()).first()) + "   ·   " + upper(p.nome))]
})[
  #set text(fill: marfim)
  #align(center)[
    #v(16mm)
    #image("/build/medo-assets/faces/" + p.glyph + ".svg", width: 15mm)
    #v(9mm)
    #text(fill: ouro, size: 9pt, tracking: 4pt)[#upper(p.cap)]
    #v(7mm)
    #text(font: "Cormorant", fill: ouro, size: 44pt, weight: "medium")[#p.nome]
    #v(2mm)
    #line(length: 15mm, stroke: 0.6pt + ouro)
    #v(3mm)
    #text(fill: ouro, style: "italic", size: 13pt)[#p.ord]
  ]
]

// abertura clara (prólogo/introdução/epílogo)
#let abertura-clara(titulo, sub) = {
  v(14mm)
  align(center)[
    #text(fill: ouroC, size: 9pt, tracking: 4pt)[#upper(titulo)]
    #v(6mm)
    #text(font: "Cormorant", fill: ouroC, size: 30pt, weight: "medium")[#sub]
    #v(2mm)
    #line(length: 15mm, stroke: 0.6pt + ouroC)
  ]
  v(9mm)
}

// ---------- página de título (preta) ----------
#page(fill: fundo, footer: none)[
  #set text(fill: marfim)
  #align(center + horizon)[
    #text(font: "Cormorant", fill: ouro, size: 46pt, weight: "medium")[As Sete\ Faces\ do Medo]
    #v(6mm)
    #line(length: 24mm, stroke: 0.6pt + ouro)
    #v(6mm)
    #text(fill: marfim, style: "italic", size: 13pt)[Como o medo construiu as nossas\ escolhas, relações e vidas]
    #v(26mm)
    #text(fill: ouro, size: 11pt, tracking: 3pt)[VIVIANNE DOS SANTOS]
  ]
]

// ---------- corpo do livro ----------
#for p in livro {
  if p.kind == "face" {
    faceState.update(p.nome)
    abertura-face(p)
    corpo(p.blocos)
  } else {
    let titulo = if p.kind == "prologo" { "Prólogo" } else if p.kind == "intro" { "Introdução" } else { "Epílogo" }
    faceState.update(titulo)
    if p.kind == "prologo" {
      // prólogo abre a preto (entrada do livro)
      page(fill: fundo, footer: none)[
        #set text(fill: marfim)
        #align(center + horizon)[
          #text(fill: ouro, size: 9pt, tracking: 4pt)[PRÓLOGO]
          #v(7mm)
          #text(font: "Cormorant", fill: ouro, size: 32pt, weight: "medium")[#p.subtitulo]
          #v(3mm)
          #line(length: 16mm, stroke: 0.6pt + ouro)
        ]
      ]
      corpo(p.blocos)
    } else {
      abertura-clara(titulo, p.subtitulo)
      corpo(p.blocos)
    }
  }
  pagebreak(weak: true)
}
