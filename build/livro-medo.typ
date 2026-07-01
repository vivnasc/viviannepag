// As Sete Faces do Medo — livro completo. Ritmo contemplativo, escuro.
// Fonte: livro_medo/livro-medo.json. Flag `modo`: "escuro" | "claro".
#let livro = json("/livro_medo/livro-medo.json")
#let modo = "claro"
#let escuro = modo == "escuro"

#let ouro   = rgb("#C6A150")
#let marfim = rgb("#ECE4D2")
#let evento = rgb("#0C0A07")            // preto mais fundo — eventos
#let corpoFill = if escuro { rgb("#14110D") } else { rgb("#F3ECDA") }
#let textoCor  = if escuro { marfim } else { rgb("#221E17") }
#let acento    = if escuro { ouro } else { rgb("#9C7328") }
#let mut       = if escuro { rgb("#8A774B") } else { rgb("#9A855A") }
#let sepFile   = if escuro { "sep-losango.svg" } else { "sep-losango-claro.svg" }

#let faceState = state("face", "")

#set text(font: "EB Garamond", fill: textoCor, size: 11.5pt, lang: "pt", region: "pt")
#set par(justify: false, leading: 1.02em, spacing: 1.5em)
#set page(
  width: 148mm, height: 210mm, fill: corpoFill,
  margin: (inside: 26mm, outside: 24mm, top: 26mm, bottom: 24mm),
  header: context {
    let n = counter(page).at(here()).first()
    if n <= 2 { return }
    set text(fill: mut, size: 8.5pt, style: "italic")
    if calc.even(n) [ As Sete Faces do Medo #h(1fr) ] else [ #h(1fr) #faceState.at(here()) ]
  },
  footer: context {
    let n = counter(page).at(here()).first()
    if n <= 2 { return }
    set text(fill: mut, size: 7.5pt, tracking: 2.5pt)
    align(center)[#str(n)]
  },
)

// muito ar antes de cada secção — nova sala, novo movimento
#let secao(t) = align(center, block(above: 4.6em, below: 2.1em,
  text(fill: acento, size: 8.5pt, tracking: 3pt)[#upper(t)]))
#let capitular(txt) = {
  let cl = txt.clusters()
  grid(columns: (auto, 1fr), gutter: 2.6mm,
    text(font: "Cormorant", fill: acento, size: 42pt, baseline: 8pt)[#cl.first()],
    par(justify: false)[#cl.slice(1).join()])
}
// linhas separadas por ¦
#let multilinha(frase) = {
  for (i, part) in frase.split("¦").enumerate() { if i > 0 { linebreak() }; part }
}
// página-evento (preta) com uma frase ao centro
#let paginaFrase(glyph, rotulo, frase, grande) = page(fill: evento, header: none, footer: none)[
  #set text(fill: marfim)
  #align(center + horizon)[
    #image("/build/medo-assets/faces/" + glyph + ".svg", width: 11mm)
    #v(10mm)
    #if rotulo != "" { text(fill: ouro, size: 8pt, tracking: 4pt)[#rotulo]; v(10mm) }
    #block(width: if grande { 74% } else { 82% })[
      #set par(justify: false, leading: 0.72em)
      #text(font: "Cormorant", fill: ouro, style: "italic", size: if grande { 30pt } else { 24pt }, hyphenate: false)[#multilinha(frase)]
    ]
  ]
]

#let abertura-face(p) = page(fill: evento, header: none, footer: context {
  set text(fill: mut, size: 8pt)
  align(center)[#str(counter(page).at(here()).first())]
})[
  #metadata((titulo: p.nome, sub: p.medo, cap: p.cap)) <peca>
  #set text(fill: marfim)
  #align(center)[
    #v(30mm)
    #image("/build/medo-assets/faces/" + p.glyph + ".svg", width: 15mm)
    #v(11mm)
    #text(fill: ouro, size: 9pt, tracking: 4pt)[#upper(p.cap)]
    #v(9mm)
    #text(font: "Cormorant", fill: ouro, size: 46pt, weight: "medium")[#p.nome]
    #v(3mm)
    #line(length: 16mm, stroke: 0.6pt + ouro)
    #v(4mm)
    #text(fill: ouro, style: "italic", size: 13pt)[#p.ord]
  ]
]

#let corpo(p) = {
  let first = true
  let secs = 0
  let destDone = false
  let temFrase = ("destaque" in p) and (p.kind == "face")
  for b in p.blocos {
    if b.t == "sec" {
      // frase-evento antes da 2.ª secção (pausa após o 1.º movimento)
      if temFrase and (not destDone) and secs == 1 {
        destDone = true
        paginaFrase(p.glyph, "", p.destaque, true)
      }
      secs += 1
      secao(b.texto)
    } else {
      if first { first = false; v(26mm); capitular(b.texto) }
      else { par(justify: false)[#b.texto] }
    }
  }
  if temFrase and (not destDone) { paginaFrase(p.glyph, "", p.destaque, true) }
  if p.kind == "face" { paginaFrase(p.glyph, "A PERGUNTA QUE FICA", p.pergunta, false) }
}

#let abertura-clara(rotulo, sub) = {
  [#metadata((titulo: rotulo, sub: sub, cap: "")) <peca>]
  v(20mm)
  align(center)[
    #text(fill: acento, size: 9pt, tracking: 4pt)[#upper(rotulo)]
    #v(7mm)
    #text(font: "Cormorant", fill: acento, size: 30pt, weight: "medium")[#sub]
    #v(2mm)
    #line(length: 15mm, stroke: 0.6pt + acento)
  ]
  v(14mm)
}

// ---------- página de título ----------
#page(fill: evento, header: none, footer: none)[
  #set text(fill: marfim)
  #align(center + horizon)[
    #block[
      #set par(leading: 0.3em, spacing: 0pt)
      #text(font: "Cormorant", fill: ouro, size: 44pt, weight: "medium")[As Sete\ Faces\ do Medo]
    ]
    #v(10mm)
    #line(length: 24mm, stroke: 0.6pt + ouro)
    #v(8mm)
    #block[
      #set par(leading: 0.6em)
      #text(fill: marfim, style: "italic", size: 12.5pt)[Como o medo construiu as nossas\ escolhas, relações e vidas]
    ]
  ]
  #place(bottom + center, dy: -16mm, text(fill: ouro, size: 11pt, tracking: 3pt)[VIVIANNE DOS SANTOS])
]

// ---------- índice ----------
#page(fill: evento, header: none, footer: none)[
  #set text(fill: marfim)
  #v(15mm)
  #align(center)[
    #text(font: "Cormorant", fill: ouro, size: 27pt, weight: "medium")[Índice]
    #v(2.5mm)
    #line(length: 14mm, stroke: 0.6pt + ouro)
  ]
  #v(11mm)
  #context {
    let items = query(<peca>)
    for it in items {
      let m = it.value
      let pg = counter(page).at(it.location()).first()
      block(below: 0.75em, width: 100%, grid(columns: (1fr, auto), column-gutter: 6mm,
        {
          text(font: "Cormorant", fill: marfim, size: 13.5pt)[#m.titulo]
          if m.sub != "" { text(fill: mut, style: "italic", size: 9pt)[  ·  #m.sub] }
        },
        align(right + bottom, text(fill: ouro, size: 10.5pt)[#pg]),
      ))
    }
  }
]

// ---------- corpo do livro ----------
#for p in livro {
  if p.kind == "face" {
    faceState.update(p.nome); abertura-face(p); corpo(p)
  } else {
    let rot = if p.kind == "prologo" { "Prólogo" } else if p.kind == "intro" { "Introdução" } else { "Epílogo" }
    faceState.update(rot)
    if p.kind == "prologo" {
      page(fill: evento, header: none, footer: none)[
        #metadata((titulo: "Prólogo", sub: p.subtitulo, cap: "")) <peca>
        #set text(fill: marfim)
        #align(center + horizon)[
          #text(fill: ouro, size: 9pt, tracking: 4pt)[PRÓLOGO]
          #v(8mm)
          #text(font: "Cormorant", fill: ouro, size: 34pt, weight: "medium")[#p.subtitulo]
          #v(3mm)
          #line(length: 16mm, stroke: 0.6pt + ouro)
        ]
      ]
      corpo(p)
    } else { abertura-clara(rot, p.subtitulo); corpo(p) }
  }
  pagebreak(weak: true)
}
