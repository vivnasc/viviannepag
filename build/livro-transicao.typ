// =============================================================================
// A Grande Transição · template tipográfico (Typst)
// Lê o CONTEÚDO de livro/livro.json (semântica pura) e trata só da FORMA.
// Apreciação própria do livro: arco de ouro nas aberturas, cabeçalho corrente
// por secção, capitular, vozes distintas (carta de 2150 / interlúdios respiram),
// caixas Ideia central e Pergunta para ficar (com o olho), Mapa da Transição,
// divisórias de Parte com vinheta. Papel quente envelhecido.
//   typst compile build/livro-transicao.typ A-Grande-Transicao.pdf \
//     --font-path build/fonts --root .
// =============================================================================

#import "vendor/droplet/droplet.typ": dropcap

#let livro = json("/livro/livro.json")

// ---- paleta ----
// papel: marfim quente envelhecido, NÃO amarelado (eggshell, baixa saturação)
#let PAPER = rgb("#f4f1ea")
#let INK = rgb("#2c2114")
#let TITLEINK = rgb("#33291a")
#let SOFT = rgb("#6a5d49")
#let GOLD = rgb("#b9842f")
#let GOLDSOFT = rgb("#9c6a2c")
#let BROWN = rgb("#7a5e38")
#let FAINT = rgb("#9c8e79")

#let serif = "Fraunces"          // cortes estáticos Light(300)/Regular(400) + itálicos
#let display = "Fraunces Display" // óptico de display, leve, para os grandes títulos
#let sans = "Outfit"

// ---- ornamentos ----
#let orn(w: 34mm, c: GOLD) = box(width: w, height: 2.6mm)[
  #place(horizon, line(start: (0%, 50%), end: (40%, 50%), stroke: 0.5pt + c))
  #place(horizon, line(start: (60%, 50%), end: (100%, 50%), stroke: 0.5pt + c))
  #place(center + horizon, circle(radius: 1.4mm, stroke: 0.5pt + c))
  #place(center + horizon, circle(radius: 0.5mm, fill: c, stroke: none))
]

#let eye() = box(width: 12mm, height: 7mm)[
  #place(center + horizon, ellipse(width: 12mm, height: 6.6mm, stroke: 0.5pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 2.6mm, stroke: 0.5pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 0.9mm, fill: GOLDSOFT, stroke: none))
]

// arco alto a emoldurar a coluna (linha dupla + remates + ápice)
#let arch(w, h) = box(width: w, height: h)[
  #let lx = 0.10 * w
  #let rx = 0.90 * w
  #let sy = 0.34 * h
  #place(curve(
    stroke: 1.3pt + GOLD,
    curve.move((lx, h)),
    curve.line((lx, sy)),
    curve.cubic((lx, 0pt), (rx, 0pt), (rx, sy)),
    curve.line((rx, h)),
  ))
  #place(curve(
    stroke: 0.7pt + GOLD.transparentize(45%),
    curve.move((lx + 0.03 * w, h)),
    curve.line((lx + 0.03 * w, sy + 0.02 * h)),
    curve.cubic((lx + 0.03 * w, 0.03 * h), (rx - 0.03 * w, 0.03 * h), (rx - 0.03 * w, sy + 0.02 * h)),
    curve.line((rx - 0.03 * w, h)),
  ))
  #place(dx: lx - 1.7mm, dy: sy - 1.7mm, circle(radius: 1.7mm, fill: GOLD, stroke: none))
  #place(dx: rx - 1.7mm, dy: sy - 1.7mm, circle(radius: 1.7mm, fill: GOLD, stroke: none))
  #place(dx: w / 2 - 1mm, dy: 0.115 * h - 1mm, circle(radius: 2mm, fill: GOLD, stroke: none))
]

// capitular verdadeira (3 linhas, o texto contorna a letra) — pacote droplet
#let incipit(s) = dropcap(
  height: 3, gap: 2.6mm, hanging-indent: 0pt, justify: true,
  font: display, fill: GOLD, weight: 400,
)[#s]

// ---- página ----
#set page(
  width: 148mm, height: 210mm,
  margin: (top: 19mm, bottom: 18mm, inside: 18mm, outside: 16mm),
  fill: PAPER,
  header: context {
    let ms = query(selector(<sect>).before(here()))
    if ms.len() > 0 {
      set text(font: sans, size: 6.6pt, fill: FAINT)
      align(center, upper(text(tracking: 0.28em, ms.last().value)))
    }
  },
  footer: context {
    set text(font: sans, size: 8pt, fill: SOFT)
    align(center, counter(page).display())
  },
)

#set text(font: serif, size: 10.6pt, fill: INK, weight: 300, lang: "pt", hyphenate: true)
// arrumação que respira: parágrafos separados por ar (estilo bloco), não corridos
#set par(justify: true, leading: 0.82em, spacing: 1.5em)

// marcador que alimenta o cabeçalho corrente
#let setsect(name) = [#metadata(name)<sect>]

// ---- componentes ----
#let pagina-cheia(corpo) = page(header: none, footer: none, corpo)

#let abertura(u, voz: false) = pagina-cheia[
  #set align(center)
  #set par(justify: false)
  #set text(hyphenate: false)
  #box(width: 100%, height: 100%)[
    #place(center + top, dy: 8mm, arch(112mm, 150mm))
    #place(center + horizon, dy: -6mm, block(width: 74%)[
      #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: "medium", tracking: 0.34em)[#upper(u.kicker)]
      #v(7mm)
      #text(font: display, fill: TITLEINK, size: 26pt, weight: 300)[#u.titulo]
      #if "epigrafe" in u [
        #v(8mm)
        #text(font: serif, style: "italic", fill: BROWN, size: 11.5pt)[#u.epigrafe]
      ]
      #v(9mm)
      #orn()
    ])
  ]
]

#let corpo-capitulo(u) = {
  setsect(u.kicker)
  if "texto" in u {
    for (i, p) in u.texto.enumerate() {
      if i == 0 [#incipit(p)#parbreak()]
      else [#p#parbreak()]
    }
  }
}

// voz (carta de 2150 / interlúdios): respira mais — medida estreita, à esquerda,
// parágrafos curtos com ar entre eles, como no exemplo.
#let corpo-voz(u) = {
  if "texto" in u {
    block(width: 100%, inset: (x: 12mm))[
      #set par(justify: false, leading: 0.9em, spacing: 1.9em)
      #set text(size: 11pt, fill: INK)
      #for p in u.texto [#p#parbreak()]
    ]
  }
}

#let caixa-ideia(t) = align(center, block(
  width: 108mm, inset: (x: 9mm, y: 7mm), radius: 1.6mm, breakable: false,
  stroke: 0.5pt + GOLD.transparentize(55%), fill: GOLD.transparentize(95%),
)[
  #text(font: sans, fill: GOLDSOFT, size: 7.5pt, weight: "medium", tracking: 0.28em)[IDEIA CENTRAL]
  #v(3.5mm)
  #set par(justify: false, leading: 0.78em)
  #text(fill: TITLEINK, size: 10.6pt)[#t]
])

#let caixa-pergunta(t) = align(center, block(
  width: 108mm, inset: (x: 9mm, y: 7mm), radius: 1.6mm, breakable: false,
  stroke: 0.5pt + GOLD.transparentize(55%), fill: GOLD.transparentize(95%),
)[
  #eye()
  #v(2.5mm)
  #text(font: sans, fill: GOLDSOFT, size: 7.5pt, weight: "medium", tracking: 0.28em)[PERGUNTA PARA FICAR]
  #v(3mm)
  #text(style: "italic", fill: BROWN, size: 11.5pt)[#t]
])

#let aparato(u) = {
  if "ideia" in u { v(9mm); caixa-ideia(u.ideia) }
  if "pergunta" in u { v(5mm); caixa-pergunta(u.pergunta) }
}

#let divisoria-parte(u) = pagina-cheia[
  #setsect(u.titulo)
  #set align(center)
  #set par(justify: false)
  #set text(hyphenate: false)
  #box(width: 100%, height: 100%)[
    #place(center + horizon)[
      #text(font: sans, fill: GOLDSOFT, size: 10pt, weight: "medium", tracking: 0.4em)[#upper(u.kicker)]
      #v(6mm)
      #text(font: display, fill: TITLEINK, size: 28pt, weight: 300)[#u.titulo]
      #v(8mm)
      #orn()
      #v(11mm)
      #block(
        width: 108mm, height: 64mm, radius: 1.6mm, clip: true,
        stroke: 0.5pt + GOLD.transparentize(50%), fill: GOLDSOFT.transparentize(94%),
      )[
        #align(center + horizon, text(font: sans, fill: FAINT, size: 8pt, tracking: 0.22em)[
          #upper[vinheta · #u.kicker]
        ])
      ]
    ]
  ]
]

#let mapa() = {
  pagebreak()
  setsect("Cartografia da consciência")
  set align(center)
  text(font: sans, fill: GOLDSOFT, size: 8pt, weight: "medium", tracking: 0.3em)[CARTOGRAFIA DA CONSCIÊNCIA]
  v(2mm)
  text(font: display, fill: TITLEINK, size: 22pt, weight: 300)[Mapa da Transição]
  v(5mm)
  orn()
  v(9mm)
  // três círculos sobrepostos
  box(width: 150mm, height: 52mm)[
    #let cs(t, s, fill, txtc, sub) = align(center + horizon)[
      #text(font: sans, size: 7pt, weight: "medium", tracking: 0.22em, fill: txtc)[#upper(t)]\
      #text(style: "italic", size: 7.5pt, fill: sub)[#s]
    ]
    #place(dx: 0mm, circle(radius: 26mm, fill: rgb(54,44,30).transparentize(40%), stroke: 0.6pt + GOLD.transparentize(50%)))
    #place(dx: 45mm, circle(radius: 26mm, fill: GOLDSOFT.transparentize(94%), stroke: 0.6pt + GOLD.transparentize(50%)))
    #place(dx: 90mm, circle(radius: 26mm, fill: rgb(140,128,92).transparentize(90%), stroke: 0.6pt + GOLD.transparentize(50%)))
    #place(dx: 0mm, box(width: 52mm, height: 52mm, cs("Sobrevivência", [viver\ para não morrer], none, rgb("#f6f2ea"), rgb("#efe7d6"))))
    #place(dx: 49mm, box(width: 52mm, height: 52mm, cs("Fissura", [entre-mundos\ perda e possibilidade], none, GOLDSOFT, SOFT)))
    #place(dx: 98mm, box(width: 52mm, height: 52mm, cs("Emergência", [viver\ para criar e significar], none, GOLDSOFT, SOFT)))
  ]
  v(7mm)
  line(length: 128mm, stroke: 0.6pt + GOLD.transparentize(50%))
  v(5mm)
  let col(h, items) = block(width: 48mm)[
    #text(font: sans, size: 7.5pt, weight: "medium", tracking: 0.22em, fill: GOLDSOFT)[#upper(h)]
    #v(2mm)
    #line(length: 40mm, stroke: 0.6pt + GOLD.transparentize(65%))
    #v(2mm)
    #set text(size: 8.5pt, fill: SOFT)
    #items.join(linebreak())
  ]
  grid(columns: 3, column-gutter: 4mm,
    col("Mecanismos", ("medo", "escassez", "controlo", "identidade defensiva", "esforço")),
    col("Experiência", ("crise de sentido", "luto do antigo", "deslocamento", "busca", "pergunta")),
    col("Emergências", ("criação", "cooperação", "consciência", "identidade fluida", "significado")),
  )
  pagebreak()
}

// =============================================================================
// rosto
// =============================================================================
#pagina-cheia[
  #set align(center + horizon)
  #set par(justify: false)
  #set text(hyphenate: false)
  #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: "medium", tracking: 0.3em)[#upper(livro.selo)]
  #v(7mm); #orn(); #v(12mm)
  #text(font: display, fill: TITLEINK, size: 40pt, weight: 300)[#livro.titulo]
  #v(8mm)
  #text(font: serif, style: "italic", fill: SOFT, size: 12.5pt)[#livro.subtitulo]
  #v(12mm); #orn(); #v(8mm)
  #text(font: sans, fill: INK, size: 10pt, tracking: 0.3em)[#upper(livro.autora)]
]

// =============================================================================
// corpo do livro
// =============================================================================
#let mapa-posta = false
#for u in livro.unidades {
  if u.tipo == "parte" {
    if not mapa-posta { mapa(); mapa-posta = true }
    divisoria-parte(u)
  } else if u.tipo == "prologo" or u.tipo == "introducao" {
    abertura(u)
    corpo-voz(u)
    aparato(u)
  } else if u.tipo == "capitulo" {
    abertura(u)
    corpo-capitulo(u)
    aparato(u)
  } else if u.tipo == "interludio" {
    abertura(u)
    corpo-voz(u)
  } else if u.tipo == "epilogo" {
    abertura(u)
    corpo-voz(u)
    aparato(u)
  }
}

// colofão
#pagina-cheia[
  #set align(center + horizon)
  #orn(); #v(10mm)
  #text(font: serif, style: "italic", fill: TITLEINK, size: 15pt, weight: 300)[
    A dureza com que tratamos a vida não é quem somos, é a estação em que vivemos.
  ]
  #v(9mm)
  #text(font: sans, fill: FAINT, size: 7.5pt, tracking: 0.26em)[#upper[© 2026 #livro.autora · #livro.selo]]
]
