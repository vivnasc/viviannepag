// =============================================================================
// A Grande Transição · template tipográfico (Typst)
// Conteúdo de livro/livro.json; aqui só a FORMA. Conceito (Vivianne):
// um livro delicado, moderno, imponente e valioso. Geometria sagrada (alinhado,
// simétrico). O ARCO pertence só à voz da carta de 2150 (prólogo/interlúdios/
// epílogo). A PARTE abre COM o seu primeiro capítulo, com a IMAGEM a sangrar na
// vertical pela margem. Cada CAPÍTULO RESPIRA: tem quebras de movimento (espaço
// branco + ornamento discreto) nas viragens do argumento. Uma só CAIXA — a Ideia
// central; a Pergunta fica aberta (olho + itálico); a dica é uma nota discreta.
//   typst compile build/livro-transicao.typ A-Grande-Transicao.pdf \
//     --font-path build/fonts/static --root .
// =============================================================================

#import "vendor/droplet/droplet.typ": dropcap

#let livro = json("/livro/livro.json")

// ---- paleta ----
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

// ---- ornamentos ----
#let lozenge(s: 1.5mm, c: GOLD) = rotate(45deg, square(size: s, stroke: 0.45pt + c))
#let rule-orn(w: 34mm, c: GOLD) = box(width: w, height: 3mm)[
  #place(horizon, line(start: (0%, 50%), end: (40%, 50%), stroke: 0.45pt + c))
  #place(horizon, line(start: (60%, 50%), end: (100%, 50%), stroke: 0.45pt + c))
  #place(center + horizon, lozenge())
]
// quebra de movimento: o RESPIRO dentro do capítulo (espaço branco + losango)
#let movbreak() = block(above: 9mm, below: 9mm, width: 100%, breakable: false,
  align(center, box(width: 22mm, height: 3mm)[
    #place(horizon, line(start: (0%, 50%), end: (36%, 50%), stroke: 0.4pt + GOLD.transparentize(15%)))
    #place(horizon, line(start: (64%, 50%), end: (100%, 50%), stroke: 0.4pt + GOLD.transparentize(15%)))
    #place(center + horizon, lozenge(s: 1.3mm))
  ]))
#let eye() = box(width: 9.5mm, height: 5.6mm)[
  #place(center + horizon, ellipse(width: 9.5mm, height: 5.2mm, stroke: 0.45pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 2mm, stroke: 0.45pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 0.7mm, fill: GOLDSOFT, stroke: none))
]
// arco (SÓ na voz da carta)
#let arch(w, h) = box(width: w, height: h)[
  #let lx = 0.10 * w
  #let rx = 0.90 * w
  #let sy = 0.34 * h
  #place(curve(stroke: 1.2pt + GOLD,
    curve.move((lx, h)), curve.line((lx, sy)),
    curve.cubic((lx, 0pt), (rx, 0pt), (rx, sy)), curve.line((rx, h))))
  #place(curve(stroke: 0.6pt + GOLD.transparentize(45%),
    curve.move((lx + 0.032 * w, h)), curve.line((lx + 0.032 * w, sy + 0.02 * h)),
    curve.cubic((lx + 0.032 * w, 0.03 * h), (rx - 0.032 * w, 0.03 * h), (rx - 0.032 * w, sy + 0.02 * h)),
    curve.line((rx - 0.032 * w, h))))
  #place(dx: lx - 1.6mm, dy: sy - 1.6mm, circle(radius: 1.6mm, fill: GOLD, stroke: none))
  #place(dx: rx - 1.6mm, dy: sy - 1.6mm, circle(radius: 1.6mm, fill: GOLD, stroke: none))
  #place(dx: w / 2 - 1mm, dy: 0.115 * h - 1mm, circle(radius: 1.9mm, fill: GOLD, stroke: none))
]
// vinheta vertical a sangrar (placeholder; a produção substitui pela imagem)
#let vinheta-vertical(kicker) = box(width: 34mm, height: 210mm,
  fill: gradient.linear(rgb("#c9bda4"), rgb("#b1a589"), rgb("#9c9078"), angle: 118deg))[
  #place(center + horizon, rotate(-90deg,
    text(font: sans, fill: rgb("#efe7d6"), size: 6.6pt, tracking: 0.34em)[IMAGEM · #upper(kicker)]))
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
#set par(justify: true, leading: 0.84em, spacing: 1.05em, first-line-indent: (amount: 5mm, all: false))

#let setsect(name) = [#metadata(name)<sect>]
#let footer-num = context { set text(font: sans, size: 7.6pt, fill: SOFT); align(center, counter(page).display()) }

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

// corpo que RESPIRA: capitular opcional + quebras de movimento nas viragens
#let corpo-paras(paras, dropcap-on: true) = {
  set par(first-line-indent: (amount: 5mm, all: true))
  let n = paras.len()
  // pontos de respiro ~ a cada 6 parágrafos, nunca no início nem no fim
  let breaks = ()
  let k = 6
  while k <= n - 3 { breaks.push(k); k += 6 }
  for (i, p) in paras.enumerate() {
    if breaks.contains(i) { movbreak() }
    if i == 0 and dropcap-on {
      set par(first-line-indent: 0pt)
      [#dropcap(height: 3, gap: 2.6mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(p)]#parbreak()]
    } else [#fmt(p)#parbreak()]
  }
}

// ---- voz (carta de 2150 / interlúdios / epílogo): ARCO + corpo a respirar ----
#let abre-voz(u, tam: 24pt) = {
  setsect(u.kicker)
  page(header: none, footer: none)[
    #set align(center)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #set text(hyphenate: false)
    #box(width: 100%, height: 100%)[
      #place(center + top, dy: 9mm, arch(112mm, 150mm))
      #place(center + horizon, dy: -3mm, block(width: 72%)[
        #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.34em)[#upper(u.kicker)]
        #v(7mm)
        #text(font: display, fill: TITLEINK, size: tam, weight: 300)[#u.titulo]
        #if "epigrafe" in u { v(8mm); text(font: serif, style: "italic", fill: BROWN, size: 11.5pt)[#u.epigrafe] }
        #v(9mm)
        #rule-orn()
      ])
    ]
  ]
  block(width: 100%, inset: (x: 11mm))[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.92em, spacing: 1.7em)
    #set text(size: 10.8pt, fill: INK)
    #for p in u.texto [#fmt(p)#parbreak()]
  ]
}

// ---- abertura de PARTE + 1.º capítulo, com IMAGEM vertical a sangrar ----
#let abre-parte-cap(partU, u) = {
  setsect(partU.titulo)
  page(margin: (left: 50mm, right: 16mm, top: 22mm, bottom: 18mm), header: none, footer: footer-num)[
    #place(top + left, dx: -50mm, dy: -22mm, vinheta-vertical(partU.kicker))
    #set align(left)
    #set text(hyphenate: false)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.34em)[#upper(partU.kicker)]
    #v(3.5mm)
    #text(font: display, fill: TITLEINK, size: 19pt, weight: 300)[#upper(partU.titulo)]
    #v(7mm)
    #box(width: 26mm, height: 3mm)[
      #place(horizon, line(start: (0%, 50%), end: (72%, 50%), stroke: 0.45pt + GOLD))
      #place(left + horizon, dx: 80%, lozenge())
    ]
    #v(9mm)
    #text(font: serif, fill: TITLEINK, size: 10.5pt, weight: 400)[#u.kicker]
    #v(2.5mm)
    #text(font: display, fill: TITLEINK, size: 16pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(5mm)
      text(font: serif, style: "italic", fill: BROWN, size: 10.5pt)[#u.epigrafe]
    }
    #v(8mm)
    #set par(justify: true, first-line-indent: 0pt)
    #dropcap(height: 3, gap: 2.6mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(u.texto.first())]
  ]
  // o resto do capítulo, largura plena, a respirar
  corpo-paras(u.texto.slice(1), dropcap-on: false)
}

// ---- capítulo seguinte (não abre Parte): sem imagem, sem arco ----
// sect: nome para o cabeçalho corrente (Introdução/Epílogo); none => herda a Parte.
#let abre-cap(u, sect: none) = {
  pagebreak()
  if sect != none { setsect(sect) }
  block(above: 0pt, below: 7mm)[
    #set align(left)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #set text(hyphenate: false)
    #text(font: serif, fill: TITLEINK, size: 10.5pt, weight: 400)[#u.kicker]
    #v(2.5mm)
    #text(font: display, fill: TITLEINK, size: 17pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(5mm)
      box(width: 14mm, height: 3mm, place(horizon, line(start: (0%, 50%), end: (100%, 50%), stroke: 0.4pt + GOLD)))
      v(2mm)
      block(width: 76%, text(font: serif, style: "italic", fill: BROWN, size: 10.5pt)[#u.epigrafe])
    }
  ]
  corpo-paras(u.texto, dropcap-on: true)
}

// ---- aparato inline (no fim do capítulo) ----
// CAIXA só na Ideia central; a Pergunta fica aberta; a dica é nota discreta.
#let caixa-ideia(corpo) = block(breakable: false, width: 100%, above: 11mm, below: 4mm)[
  #set align(center)
  #set par(justify: false, first-line-indent: 0pt, leading: 0.84em)
  #block(width: 114mm, inset: (x: 11mm, y: 8mm), stroke: 0.5pt + GOLD.transparentize(20%))[
    #place(top + left, dx: -1.5mm, dy: -1.5mm, lozenge(s: 1.3mm))
    #place(top + right, dx: 1.5mm, dy: -1.5mm, lozenge(s: 1.3mm))
    #place(bottom + left, dx: -1.5mm, dy: 1.5mm, lozenge(s: 1.3mm))
    #place(bottom + right, dx: 1.5mm, dy: 1.5mm, lozenge(s: 1.3mm))
    #text(font: sans, fill: GOLDSOFT, size: 7.6pt, weight: 500, tracking: 0.3em)[IDEIA CENTRAL]
    #v(2mm); #line(length: 15mm, stroke: 0.4pt + GOLD); #v(3.5mm)
    #text(fill: TITLEINK, size: 10.5pt)[#fmt(corpo)]
  ]
]
#let nota-dica(corpo) = block(breakable: false, width: 100%, above: 9mm, below: 3mm)[
  #block(width: 100%, inset: (left: 5mm), stroke: (left: 0.8pt + GOLD.transparentize(30%)))[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.84em)
    #text(font: sans, fill: GOLDSOFT, size: 7.4pt, weight: 500, tracking: 0.28em)[A DICA]
    #v(2.5mm)
    #text(fill: INK, size: 10pt)[#fmt(corpo)]
  ]
]
#let bloco-pergunta(corpo) = block(breakable: false, width: 100%, above: 11mm, below: 2mm)[
  #set align(center)
  #set par(justify: false, first-line-indent: 0pt, leading: 0.82em)
  #eye()
  #v(2.5mm)
  #text(font: sans, fill: GOLDSOFT, size: 7.6pt, weight: 500, tracking: 0.3em)[PERGUNTA PARA FICAR]
  #v(3.5mm)
  #block(width: 80%, text(font: serif, style: "italic", fill: BROWN, size: 12.5pt)[#fmt(corpo)])
]
#let aparato(u) = {
  if "ideia" in u { caixa-ideia(u.ideia) }
  if "dica" in u { nota-dica(u.dica) }
  if "pergunta" in u { bloco-pergunta(u.pergunta) }
}

// ---- mapa (diagrama alinhado: colunas sob os círculos) ----
#let mapa() = {
  setsect("Cartografia da consciência")
  page(header: none, footer: footer-num, margin: (x: 14mm, y: 16mm))[
    #set align(center)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #set text(hyphenate: false)
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
        text(style: "italic", size: 7.5pt, fill: sc)[#sub]))))
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
      block(above: 1mm, { set text(size: 8.2pt, fill: SOFT); set par(leading: 0.85em); items.join(linebreak()) })))))
    #box(width: W, height: 38mm)[
      #col(c1, "Mecanismos", ("medo", "escassez", "controlo", "identidade defensiva", "esforço"))
      #col(c2, "Experiência", ("crise de sentido", "luto do antigo", "deslocamento", "busca", "pergunta"))
      #col(c3, "Emergências", ("criação", "cooperação", "consciência", "identidade fluida", "significado"))
    ]
  ]
}

// ============================ rosto ==========================================
#page(header: none, footer: none)[
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
    pendente-parte = u
  } else if u.tipo == "prologo" {
    abre-voz(u)          // a carta de 2150 — único sítio com arco
    aparato(u)
  } else if u.tipo == "introducao" {
    abre-cap(u, sect: u.kicker)   // voz da autora: abertura limpa, sem arco
    aparato(u)
  } else if u.tipo == "capitulo" {
    if pendente-parte != none {
      abre-parte-cap(pendente-parte, u)
      pendente-parte = none
    } else {
      abre-cap(u)
    }
    aparato(u)
  } else if u.tipo == "interludio" {
    abre-voz(u, tam: 20pt)   // carta de 2150 — com arco
  } else if u.tipo == "epilogo" {
    abre-cap(u, sect: u.kicker)  // voz da autora: abertura limpa, sem arco
    aparato(u)
  }
}

// ============================ colofão ========================================
#page(header: none, footer: none)[
  #set align(center + horizon)
  #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
  #rule-orn(); #v(10mm)
  #block(width: 76%, text(font: serif, style: "italic", fill: TITLEINK, size: 14.5pt, weight: 300)[
    A dureza com que tratamos a vida não é quem somos, é a estação em que vivemos.
  ])
  #v(10mm)
  #text(font: sans, fill: FAINT, size: 7.4pt, tracking: 0.26em)[#upper[© 2026 #livro.autora · #livro.selo]]
]
