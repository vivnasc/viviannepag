// =============================================================================
// A Grande Transição · template tipográfico (Typst)
// Conteúdo de livro/livro.json (semântica pura); aqui só a FORMA.
// Princípios (pedidos da Vivianne): GEOMETRIA SAGRADA — tudo alinhado e
// simétrico. ARCO em todas as aberturas. CAIXAS para Ideia central · A dica ·
// Pergunta para ficar. A PARTE tem página própria (com espaço de imagem) e cada
// CAPÍTULO tem página de abertura própria; o corpo começa na página seguinte.
// Parágrafos com respiro (avanço de 1.ª linha + ar) e nunca um rio sem fim.
//   typst compile build/livro-transicao.typ A-Grande-Transicao.pdf \
//     --font-path build/fonts/static --root .
// =============================================================================

#import "vendor/droplet/droplet.typ": dropcap

#let livro = json("/livro/livro.json")

// ---- paleta (manifesto: marfim quente, ouro velho, carvão) ----
#let PAPER = rgb("#f4f1ea")
#let INK = rgb("#2c271f")
#let TITLEINK = rgb("#242019")
#let SOFT = rgb("#6b6151")
#let GOLD = rgb("#9c7a3c")
#let GOLDSOFT = rgb("#87693a")
#let BROWN = rgb("#6d5836")
#let FAINT = rgb("#9a8f7d")

#let serif = "Fraunces"
#let display = "Fraunces Display"
#let sans = "Outfit"

// ---- ornamentos (geometria contida) ----
#let lozenge(s: 1.5mm, c: GOLD) = rotate(45deg, square(size: s, stroke: 0.45pt + c))
#let rule-orn(w: 34mm, c: GOLD) = box(width: w, height: 3mm)[
  #place(horizon, line(start: (0%, 50%), end: (40%, 50%), stroke: 0.45pt + c))
  #place(horizon, line(start: (60%, 50%), end: (100%, 50%), stroke: 0.45pt + c))
  #place(center + horizon, lozenge())
]
#let eye() = box(width: 9.5mm, height: 5.6mm)[
  #place(center + horizon, ellipse(width: 9.5mm, height: 5.2mm, stroke: 0.45pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 2mm, stroke: 0.45pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 0.7mm, fill: GOLDSOFT, stroke: none))
]

// arco alto, simétrico, a emoldurar a coluna (linha dupla, remates, ápice)
#let arch(w, h) = box(width: w, height: h)[
  #let lx = 0.10 * w
  #let rx = 0.90 * w
  #let sy = 0.34 * h
  #place(curve(
    stroke: 1.2pt + GOLD,
    curve.move((lx, h)), curve.line((lx, sy)),
    curve.cubic((lx, 0pt), (rx, 0pt), (rx, sy)),
    curve.line((rx, h)),
  ))
  #place(curve(
    stroke: 0.6pt + GOLD.transparentize(45%),
    curve.move((lx + 0.032 * w, h)), curve.line((lx + 0.032 * w, sy + 0.02 * h)),
    curve.cubic((lx + 0.032 * w, 0.03 * h), (rx - 0.032 * w, 0.03 * h), (rx - 0.032 * w, sy + 0.02 * h)),
    curve.line((rx - 0.032 * w, h)),
  ))
  #place(dx: lx - 1.6mm, dy: sy - 1.6mm, circle(radius: 1.6mm, fill: GOLD, stroke: none))
  #place(dx: rx - 1.6mm, dy: sy - 1.6mm, circle(radius: 1.6mm, fill: GOLD, stroke: none))
  #place(dx: w / 2 - 1mm, dy: 0.115 * h - 1mm, circle(radius: 1.9mm, fill: GOLD, stroke: none))
]

// ---- página ----
#set page(
  width: 148mm, height: 210mm,
  margin: (top: 20mm, bottom: 18mm, inside: 18mm, outside: 16mm),
  fill: PAPER,
  header: context {
    let cur = here().page()
    let past = query(<sect>).filter(m => m.location().page() <= cur)
    if past.len() > 0 and past.last().location().page() != cur and past.last().value != "" {
      set text(font: sans, size: 6.4pt, fill: FAINT, weight: 400)
      align(center, upper(text(tracking: 0.3em, past.last().value)))
    }
  },
  footer: context {
    set text(font: sans, size: 7.6pt, fill: SOFT)
    align(center, counter(page).display())
  },
)

#set text(font: serif, size: 10.5pt, fill: INK, weight: 300, lang: "pt", hyphenate: true)
#set par(justify: true, leading: 0.84em, spacing: 1.2em, first-line-indent: (amount: 5mm, all: false))

#let setsect(name) = [#metadata(name)<sect>]

// **negrito** / *itálico* a partir do conteúdo (nada é inventado aqui)
#let fmt(s) = {
  let acc = []
  for (i, seg) in s.split("**").enumerate() {
    let inner = []
    for (j, t) in seg.split("*").enumerate() {
      if calc.even(j) { inner += [#t] } else { inner += emph[#t] }
    }
    if calc.even(i) { acc += inner } else { acc += strong(inner) }
  }
  acc
}

#let pagina-cheia(corpo) = page(header: none, footer: none, corpo)

// ---- abertura emoldurada pelo arco (capítulos, interlúdios, prólogo) ----
#let arco-opener(kicker, titulo, epigrafe: none, titulo-tamanho: 24pt) = pagina-cheia[
  #set align(center)
  #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
  #set text(hyphenate: false)
  #box(width: 100%, height: 100%)[
    #place(center + top, dy: 9mm, arch(112mm, 150mm))
    #place(center + horizon, dy: -3mm, block(width: 72%)[
      #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.34em)[#upper(kicker)]
      #v(7mm)
      #text(font: display, fill: TITLEINK, size: titulo-tamanho, weight: 300)[#titulo]
      #if epigrafe != none {
        v(8mm)
        text(font: serif, style: "italic", fill: BROWN, size: 11.5pt)[#epigrafe]
      }
      #v(9mm)
      #rule-orn()
    ])
  ]
]

// ---- página própria da PARTE (com espaço de imagem bem visível) ----
#let parte-page(u, chave) = {
  setsect(u.titulo)
  pagina-cheia[
    #set align(center)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #set text(hyphenate: false)
    #v(15mm)
    #lozenge(s: 2.4mm)
    #v(8mm)
    #text(font: sans, fill: GOLDSOFT, size: 11pt, weight: 500, tracking: 0.42em)[#upper(u.kicker)]
    #v(6mm)
    #text(font: display, fill: TITLEINK, size: 30pt, weight: 300)[#upper(u.titulo)]
    #v(10mm)
    #rule-orn(w: 40mm)
    #v(10mm)
    // ESPAÇO DA IMAGEM (vinheta da Parte) — claramente assinalado
    #block(
      width: 110mm, height: 58mm, radius: 0pt, breakable: false,
      stroke: 0.5pt + GOLD.transparentize(40%), fill: GOLD.transparentize(95%),
    )[
      #set align(center + horizon)
      #stack(spacing: 3mm,
        text(font: sans, fill: FAINT, size: 7.5pt, tracking: 0.3em)[IMAGEM],
        text(font: sans, fill: FAINT, size: 7pt, tracking: 0.2em)[vinheta · #u.kicker],
      )
    ]
  ]
}

// ---- corpo do capítulo (capitular + respiro + avanço de 1.ª linha) ----
#let corpo-capitulo(u) = {
  set par(first-line-indent: (amount: 5mm, all: true))
  if "texto" in u {
    for (i, p) in u.texto.enumerate() {
      if i == 0 {
        set par(first-line-indent: 0pt)
        [#dropcap(height: 3, gap: 2.6mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(p)]#parbreak()]
      } else [#fmt(p)#parbreak()]
    }
  }
}

// ---- voz (carta de 2150 / interlúdios): corpo a respirar, medida estreita ----
#let corpo-voz(u) = block(width: 100%, inset: (x: 11mm))[
  #set par(justify: false, first-line-indent: 0pt, leading: 0.92em, spacing: 1.7em)
  #set text(size: 10.8pt, fill: INK)
  #for p in u.texto [#fmt(p)#parbreak()]
]

// ---- caixa (geometria sagrada: moldura fina + losangos nos cantos) ----
#let caixa(rotulo, corpo, italico: false, com-olho: false, larg: 116mm) = block(
  breakable: false, width: 100%, above: 6mm, below: 3mm,
)[
  #set align(center)
  #set par(justify: false, first-line-indent: 0pt, leading: 0.82em)
  #block(width: larg, inset: (x: 11mm, y: 6.5mm), stroke: 0.5pt + GOLD.transparentize(20%))[
    #place(top + left, dx: -1.5mm, dy: -1.5mm, lozenge(s: 1.3mm))
    #place(top + right, dx: 1.5mm, dy: -1.5mm, lozenge(s: 1.3mm))
    #place(bottom + left, dx: -1.5mm, dy: 1.5mm, lozenge(s: 1.3mm))
    #place(bottom + right, dx: 1.5mm, dy: 1.5mm, lozenge(s: 1.3mm))
    #if com-olho [#eye() #v(2.5mm)]
    #text(font: sans, fill: GOLDSOFT, size: 7.6pt, weight: 500, tracking: 0.3em)[#upper(rotulo)]
    #v(2mm)
    #line(length: 15mm, stroke: 0.4pt + GOLD)
    #v(3.5mm)
    #if italico [
      #text(font: serif, style: "italic", fill: BROWN, size: 12pt)[#fmt(corpo)]
    ] else [
      #text(fill: TITLEINK, size: 10.5pt)[#fmt(corpo)]
    ]
  ]
]

// fecho do capítulo: as três caixas juntas, em página própria, centradas.
#let aparato(u) = {
  if ("ideia" in u) or ("dica" in u) or ("pergunta" in u) {
    pagina-cheia[
      #set align(center + horizon)
      #block(width: 100%)[
        #if "ideia" in u { caixa("Ideia central", u.ideia) }
        #if "dica" in u { caixa("A dica", u.dica, larg: 108mm) }
        #if "pergunta" in u { caixa("Pergunta para ficar", u.pergunta, italico: true, com-olho: true) }
      ]
    ]
  }
}

// ---- mapa (diagrama alinhado: colunas exactamente sob os círculos) ----
#let mapa() = {
  setsect("Cartografia da consciência")
  page(header: none, footer: none, margin: (x: 14mm, y: 16mm))[
    #set align(center)
    #set par(justify: false, first-line-indent: 0pt)
    #set text(hyphenate: false)
    // largura útil = 148 - 28 = 120mm; centros e colunas partilham o mesmo eixo
    #let W = 120mm
    #let c1 = 24mm
    #let c2 = 60mm
    #let c3 = 96mm
    #let R = 22mm
    #v(4mm)
    #text(font: sans, fill: GOLDSOFT, size: 8pt, weight: 500, tracking: 0.32em)[CARTOGRAFIA DA CONSCIÊNCIA]
    #v(3mm)
    #text(font: display, fill: TITLEINK, size: 22pt, weight: 300)[Mapa da Transição]
    #v(5mm)
    #rule-orn()
    #v(11mm)
    #box(width: W, height: 2 * R)[
      #let circ(cx, fill) = place(dx: cx - R, dy: 0mm, circle(radius: R, fill: fill, stroke: 0.5pt + GOLD.transparentize(45%)))
      #let lab(cx, t, sub, tc, sc) = place(dx: cx - 18mm, dy: 0mm, box(width: 36mm, height: 2 * R, align(center + horizon, stack(spacing: 1.6mm,
        text(font: sans, size: 7pt, weight: 500, tracking: 0.18em, fill: tc)[#upper(t)],
        text(style: "italic", size: 7.5pt, fill: sc)[#sub],
      ))))
      #circ(c1, rgb(48, 40, 28).transparentize(42%))
      #circ(c2, GOLD.transparentize(93%))
      #circ(c3, rgb(135, 120, 86).transparentize(90%))
      #lab(c1, "Sobrevivência", [viver para não morrer], rgb("#f6f2ea"), rgb("#e7dfce"))
      #lab(c2, "Fissura", [perda e possibilidade], GOLDSOFT, SOFT)
      #lab(c3, "Emergência", [criar e significar], GOLDSOFT, SOFT)
    ]
    #v(9mm)
    #line(length: W, stroke: 0.5pt + GOLD.transparentize(45%))
    #v(7mm)
    #let col(cx, h, items) = place(dx: cx - 18mm, box(width: 36mm, align(center, stack(spacing: 2.2mm,
      text(font: sans, size: 7.3pt, weight: 500, tracking: 0.16em, fill: GOLDSOFT)[#upper(h)],
      line(length: 30mm, stroke: 0.4pt + GOLD.transparentize(55%)),
      block(above: 1mm, { set text(size: 8.2pt, fill: SOFT); set par(leading: 0.85em); items.join(linebreak()) }),
    ))))
    #box(width: W, height: 38mm)[
      #col(c1, "Mecanismos", ("medo", "escassez", "controlo", "identidade defensiva", "esforço"))
      #col(c2, "Experiência", ("crise de sentido", "luto do antigo", "deslocamento", "busca", "pergunta"))
      #col(c3, "Emergências", ("criação", "cooperação", "consciência", "identidade fluida", "significado"))
    ]
  ]
}

// ============================ rosto ==========================================
#pagina-cheia[
  #set align(center + horizon)
  #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
  #set text(hyphenate: false)
  #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.32em)[#upper(livro.selo)]
  #v(7mm); #rule-orn(); #v(13mm)
  #text(font: display, fill: TITLEINK, size: 40pt, weight: 300)[#livro.titulo]
  #v(8mm)
  #text(font: serif, style: "italic", fill: SOFT, size: 12.5pt)[#livro.subtitulo]
  #v(13mm); #rule-orn(); #v(8mm)
  #text(font: sans, fill: INK, size: 10pt, tracking: 0.32em)[#upper(livro.autora)]
]

// ============================ corpo do livro =================================
#let pendente-parte = none
#let mapa-posta = false
#for u in livro.unidades {
  if u.tipo == "parte" {
    if not mapa-posta { mapa(); mapa-posta = true }
    parte-page(u, u.kicker)
  } else if u.tipo == "prologo" or u.tipo == "introducao" {
    arco-opener(u.kicker, u.titulo, epigrafe: u.at("epigrafe", default: none))
    corpo-voz(u)
    aparato(u)
  } else if u.tipo == "capitulo" {
    arco-opener(u.kicker, u.titulo, epigrafe: u.at("epigrafe", default: none), titulo-tamanho: 22pt)
    corpo-capitulo(u)
    aparato(u)
  } else if u.tipo == "interludio" {
    arco-opener(u.kicker, u.titulo, epigrafe: u.at("epigrafe", default: none), titulo-tamanho: 20pt)
    corpo-voz(u)
  } else if u.tipo == "epilogo" {
    arco-opener(u.kicker, u.titulo, epigrafe: u.at("epigrafe", default: none))
    corpo-voz(u)
    aparato(u)
  }
}

// ============================ colofão ========================================
#pagina-cheia[
  #set align(center + horizon)
  #set par(justify: false, first-line-indent: 0pt)
  #rule-orn(); #v(10mm)
  #block(width: 76%, text(font: serif, style: "italic", fill: TITLEINK, size: 14.5pt, weight: 300)[
    A dureza com que tratamos a vida não é quem somos, é a estação em que vivemos.
  ])
  #v(10mm)
  #text(font: sans, fill: FAINT, size: 7.4pt, tracking: 0.26em)[#upper[© 2026 #livro.autora · #livro.selo]]
]
