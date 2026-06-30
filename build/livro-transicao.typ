// =============================================================================
// A Grande Transição · template tipográfico (Typst) — apreciação editorial
// Conteúdo de livro/livro.json (semântica pura); aqui só a FORMA.
// Referência da Vivianne: livro de editora, não maqueta. Cabeçalho do capítulo a
// fluir direito para o texto (sem página de abertura em branco, sem arco
// geométrico), capitular escura de 3 linhas, parágrafos com indentação de
// primeira linha, paleta antiga contida (carvão + ouro velho), secções de
// aparato SEM caixa (rótulo + texto), vinheta a sangrar na divisória de Parte.
//   typst compile build/livro-transicao.typ A-Grande-Transicao.pdf \
//     --font-path build/fonts/static --root .
// =============================================================================

#import "vendor/droplet/droplet.typ": dropcap

#let livro = json("/livro/livro.json")

// ---- paleta (manifesto: brancos quentes, dourado/champanhe contido, carvão) ----
#let PAPER = rgb("#f4f1ea")   // marfim quente, não amarelado
#let INK = rgb("#2c271f")     // tinta do corpo
#let TITLEINK = rgb("#242019")// carvão quase preto dos títulos
#let SOFT = rgb("#6b6151")
#let GOLD = rgb("#9c7a3c")    // ouro velho (não alaranjado)
#let GOLDSOFT = rgb("#87693a")
#let BROWN = rgb("#6d5836")   // epígrafe
#let FAINT = rgb("#9a8f7d")

#let serif = "Fraunces"
#let display = "Fraunces Display"
#let sans = "Outfit"

// ---- ornamentos contidos ----
// régua fina com losango ao centro
#let rule-orn(w: 32mm, c: GOLD) = box(width: w, height: 2.4mm)[
  #place(horizon, line(start: (0%, 50%), end: (42%, 50%), stroke: 0.4pt + c))
  #place(horizon, line(start: (58%, 50%), end: (100%, 50%), stroke: 0.4pt + c))
  #place(center + horizon, rotate(45deg, square(size: 1.5mm, stroke: 0.4pt + c)))
]
// losango sozinho (separador de movimento)
#let lozenge(c: GOLD) = rotate(45deg, square(size: 1.4mm, stroke: 0.4pt + c))
// olho (pergunta para ficar)
#let eye() = box(width: 9mm, height: 5.4mm)[
  #place(center + horizon, ellipse(width: 9mm, height: 5mm, stroke: 0.4pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 1.9mm, stroke: 0.4pt + GOLDSOFT))
  #place(center + horizon, circle(radius: 0.7mm, fill: GOLDSOFT, stroke: none))
]

// ---- página ----
#set page(
  width: 148mm, height: 210mm,
  margin: (top: 20mm, bottom: 18mm, inside: 18mm, outside: 16mm),
  fill: PAPER,
  header: context {
    // secção corrente por número de página (inclui metadados da própria página);
    // na 1.ª página de uma secção não se mostra cabeçalho (convenção de livro).
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
// arrumação de livro: avanço na 1.ª linha + ar entre parágrafos (como o exemplo)
#set par(justify: true, leading: 0.84em, spacing: 1.15em, first-line-indent: (amount: 5mm, all: false))

#let setsect(name) = [#metadata(name)<sect>]

// formatação inline a partir das fontes: **negrito** para destacar frases e
// *itálico*. Nada é inventado aqui; só se realça o que vier marcado no conteúdo.
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

// ============================ componentes ====================================

// cabeçalho de capítulo a fluir para o texto (sem página em branco).
// partU != none quando é o 1.º capítulo de uma Parte: leva a divisória da Parte.
#let abre-capitulo(u, partU: none, vinheta: none) = {
  pagebreak()
  // divisória da Parte (em cima, no mesmo bloco do capítulo)
  if partU != none {
    setsect(partU.titulo)
    block(above: 0pt, below: 7mm)[
      #set align(left)
      #set par(first-line-indent: 0pt)
      #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.36em)[#upper(partU.kicker)]
      #v(3.5mm)
      #set par(leading: 0.5em)
      #set text(hyphenate: false)
      #text(font: display, fill: TITLEINK, size: 19pt, weight: 300, tracking: 0.02em)[#upper(partU.titulo)]
      #if vinheta != none {
        v(5mm)
        block(width: 100%, height: 30mm, clip: true, radius: 0pt, vinheta)
      }
      #v(4mm)
      #align(center, rule-orn())
    ]
  }
  // cabeçalho do capítulo
  block(above: 0pt, below: 6mm)[
    #set align(left)
    #set par(first-line-indent: 0pt)
    #set text(hyphenate: false)
    #text(font: serif, fill: TITLEINK, size: 10.5pt, weight: 400)[#u.kicker]
    #v(2mm)
    #set par(leading: 0.5em)
    #text(font: display, fill: TITLEINK, size: 17pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(5mm)
      align(center)[
        #line(length: 14mm, stroke: 0.4pt + GOLD)
        #v(2.5mm)
        #block(width: 80%, text(font: serif, style: "italic", fill: BROWN, size: 10.5pt)[#u.epigrafe])
      ]
      v(5mm)
    }
  ]
  // corpo com capitular escura de 3 linhas; indentação de 1.ª linha em todos os
  // parágrafos menos o da capitular.
  set par(first-line-indent: (amount: 5mm, all: true))
  if "texto" in u {
    for (i, p) in u.texto.enumerate() {
      if i == 0 {
        set par(first-line-indent: 0pt)
        [#dropcap(height: 3, gap: 2.4mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(p)]#parbreak()]
      } else [#fmt(p)#parbreak()]
    }
  }
}

// voz (carta de 2150 / interlúdios): página própria, título centrado em cima,
// corpo a respirar (medida estreita, à esquerda). Sem arco.
#let abre-voz(u) = {
  pagebreak()
  setsect(u.kicker)
  block(above: 4mm, below: 8mm)[
    #set align(center)
    #set par(first-line-indent: 0pt)
    #set text(hyphenate: false)
    #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.36em)[#upper(u.kicker)]
    #v(5mm)
    #text(font: display, fill: TITLEINK, size: 22pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(6mm)
      block(width: 74%, text(font: serif, style: "italic", fill: BROWN, size: 11pt)[#u.epigrafe])
    }
    #v(6mm)
    #rule-orn()
  ]
  block(width: 100%, inset: (x: 10mm))[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.92em, spacing: 1.6em)
    #set text(size: 10.8pt, fill: INK)
    #for p in u.texto [#fmt(p)#parbreak()]
  ]
}

// aparato SEM caixa: rótulo em maiúsculas de ouro + texto; separados por ar.
#let secao-aparato(rotulo, corpo, italico: false, com-olho: false) = block(
  above: 9mm, below: 2mm, breakable: false, width: 100%,
)[
  #set align(center)
  #if com-olho [#eye() #v(2.5mm)]
  #text(font: sans, fill: GOLDSOFT, size: 7.6pt, weight: 500, tracking: 0.3em)[#upper(rotulo)]
  #v(3.5mm)
  #block(width: 84%)[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.82em)
    #if italico [
      #text(font: serif, style: "italic", fill: BROWN, size: 11.5pt)[#fmt(corpo)]
    ] else [
      #text(fill: TITLEINK, size: 10.5pt)[#fmt(corpo)]
    ]
  ]
]

// "A dica": nota prática, discreta, alinhada à esquerda, com losango-marca.
#let secao-dica(corpo) = block(above: 8mm, below: 2mm, breakable: false, width: 100%)[
  #block(width: 100%, inset: (left: 4mm), stroke: (left: 0.8pt + GOLD.transparentize(35%)))[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.84em)
    #text(font: sans, fill: GOLDSOFT, size: 7.4pt, weight: 500, tracking: 0.28em)[A DICA]
    #v(2.5mm)
    #text(fill: INK, size: 10pt)[#fmt(corpo)]
  ]
]

#let aparato(u) = {
  if "ideia" in u { secao-aparato("Ideia central", u.ideia) }
  if "dica" in u { secao-dica(u.dica) }
  if ("ideia" in u or "dica" in u) and "pergunta" in u { v(6mm); align(center, lozenge()) }
  if "pergunta" in u { secao-aparato("Pergunta para ficar", u.pergunta, italico: true, com-olho: true) }
}

// ============================ mapa ===========================================
#let mapa() = {
  pagebreak()
  setsect("Cartografia da consciência")
  set align(center)
  set par(first-line-indent: 0pt)
  text(font: sans, fill: GOLDSOFT, size: 8pt, weight: 500, tracking: 0.32em)[CARTOGRAFIA DA CONSCIÊNCIA]
  v(2mm)
  text(font: display, fill: TITLEINK, size: 20pt, weight: 300)[Mapa da Transição]
  v(5mm)
  rule-orn()
  v(11mm)
  box(width: 150mm, height: 52mm)[
    #let cs(t, sub, tc, sc) = align(center + horizon)[
      #text(font: sans, size: 7pt, weight: 500, tracking: 0.2em, fill: tc)[#upper(t)]\
      #text(style: "italic", size: 7.5pt, fill: sc)[#sub]
    ]
    #place(dx: 0mm, circle(radius: 26mm, fill: rgb(48,40,28).transparentize(42%), stroke: 0.5pt + GOLD.transparentize(45%)))
    #place(dx: 45mm, circle(radius: 26mm, fill: GOLD.transparentize(93%), stroke: 0.5pt + GOLD.transparentize(45%)))
    #place(dx: 90mm, circle(radius: 26mm, fill: rgb(135,120,86).transparentize(90%), stroke: 0.5pt + GOLD.transparentize(45%)))
    #place(dx: 0mm, box(width: 52mm, height: 52mm, cs("Sobrevivência", [viver\ para não morrer], rgb("#f6f2ea"), rgb("#e7dfce"))))
    #place(dx: 49mm, box(width: 52mm, height: 52mm, cs("Fissura", [entre-mundos\ perda e possibilidade], GOLDSOFT, SOFT)))
    #place(dx: 98mm, box(width: 52mm, height: 52mm, cs("Emergência", [viver\ para criar e significar], GOLDSOFT, SOFT)))
  ]
  v(7mm)
  line(length: 128mm, stroke: 0.5pt + GOLD.transparentize(45%))
  v(5mm)
  let col(h, items) = block(width: 48mm)[
    #text(font: sans, size: 7.5pt, weight: 500, tracking: 0.2em, fill: GOLDSOFT)[#upper(h)]
    #v(2mm)
    #line(length: 40mm, stroke: 0.5pt + GOLD.transparentize(60%))
    #v(2mm)
    #set text(size: 8.5pt, fill: SOFT)
    #set par(first-line-indent: 0pt)
    #items.join(linebreak())
  ]
  grid(columns: 3, column-gutter: 4mm,
    col("Mecanismos", ("medo", "escassez", "controlo", "identidade defensiva", "esforço")),
    col("Experiência", ("crise de sentido", "luto do antigo", "deslocamento", "busca", "pergunta")),
    col("Emergências", ("criação", "cooperação", "consciência", "identidade fluida", "significado")),
  )
}

// ============================ rosto ==========================================
#page(header: none, footer: none)[
  #set align(center + horizon)
  #set par(justify: false, first-line-indent: 0pt)
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
    pendente-parte = u
  } else if u.tipo == "prologo" or u.tipo == "introducao" {
    abre-voz(u)
    aparato(u)
  } else if u.tipo == "capitulo" {
    if pendente-parte != none and not mapa-posta { mapa(); mapa-posta = true }
    let vin = if pendente-parte != none {
      align(center + horizon, box(width: 100%, height: 100%, fill: GOLD.transparentize(94%),
        align(center + horizon, text(font: sans, fill: FAINT, size: 7.5pt, tracking: 0.22em)[#upper[vinheta · #pendente-parte.kicker]])))
    } else { none }
    abre-capitulo(u, partU: pendente-parte, vinheta: vin)
    aparato(u)
    pendente-parte = none
  } else if u.tipo == "interludio" {
    abre-voz(u)
  } else if u.tipo == "epilogo" {
    abre-voz(u)
    aparato(u)
  }
}

// ============================ colofão ========================================
#page(header: none, footer: none)[
  #set align(center + horizon)
  #set par(justify: false, first-line-indent: 0pt)
  #rule-orn(); #v(10mm)
  #block(width: 78%, text(font: serif, style: "italic", fill: TITLEINK, size: 14.5pt, weight: 300)[
    A dureza com que tratamos a vida não é quem somos, é a estação em que vivemos.
  ])
  #v(10mm)
  #text(font: sans, fill: FAINT, size: 7.4pt, tracking: 0.26em)[#upper[© 2026 #livro.autora · #livro.selo]]
]
