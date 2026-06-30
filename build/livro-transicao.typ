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

// ---- linguagem MODERNA / FUTURISTA (sem olho, caixa, arco, fleurons) ----
// Motivo recorrente: o ANEL (consciência, totalidade, o anel de luz da Parte IV,
// o sinal de 2150). Linhas finíssimas, brilho suave, muito espaço.
#let hairline(w: 30mm, c: GOLD, t: 0.4pt) = line(length: w, stroke: t + c)
#let ring(d: 6mm, c: GOLD, t: 0.5pt) = circle(radius: d / 2, stroke: t + c)
// A MARCA da Vivianne (o véu) — o símbolo do livro, da própria marca dela
#let marca(h: 12mm) = box(height: h, image("vendor/marca/simbolo.svg", height: h))
// brilho suave (a luz que emana da matéria, do manifesto)
#let glow(d: 100mm, c: GOLD, op: 86%) = circle(radius: d / 2, stroke: none,
  fill: gradient.radial(c.transparentize(op), c.transparentize(100%)))
// divisória moderna: hairline — anel fino — hairline
#let divisoria(w: 44mm, c: GOLD) = box(width: w, height: 6mm)[
  #place(horizon, line(start: (0%, 50%), end: (40%, 50%), stroke: 0.4pt + c))
  #place(horizon, line(start: (60%, 50%), end: (100%, 50%), stroke: 0.4pt + c))
  #place(center + horizon, marca(h: 4.5mm))
]
#let mini-rule(w: 26mm, c: GOLD) = box(width: w, height: 5mm)[
  #place(horizon, line(start: (0%, 50%), end: (42%, 50%), stroke: 0.4pt + c))
  #place(horizon, line(start: (58%, 50%), end: (100%, 50%), stroke: 0.4pt + c))
  #place(center + horizon, marca(h: 4mm))
]
// compat.: rule-orn passa a ser a divisória moderna
#let rule-orn(w: 44mm, c: GOLD) = divisoria(w: w, c: c)
// quebra de movimento: um anel fino ao centro. sticky (nunca órfão).
#let movbreak() = block(above: 11mm, below: 11mm, width: 100%, breakable: false, sticky: true,
  align(center, marca(h: 6mm)))
// destaque (pull-quote): frase forte do capítulo, entre hairlines finas
#let destaque(frase) = block(above: 13mm, below: 13mm, width: 100%, breakable: false, sticky: true)[
  #set align(center)
  #set par(justify: false, first-line-indent: 0pt, leading: 1.0em)
  #marca(h: 6mm)
  #v(5mm)
  #block(width: 84%, text(font: display, style: "italic", fill: GOLDSOFT, size: 16pt, weight: 300)[#frase])
  #v(5mm)
  #hairline(w: 14mm)
]
// ---- SISTEMA SEMÂNTICO de símbolos (livro/sistema.json) ----
// cada TIPO de conteúdo tem ícone + cor + moldura; o template gera tudo daqui.
#let sistema = json("/livro/sistema.json")
// SEM ícones desenhados: cada bloco distingue-se pela COR + MOLDURA + rótulo.
// (o lugar de uma marca tua, se quiseres, é a SVG em vendor/marca/simbolo.svg.)

// vinheta vertical a sangrar (placeholder; a produção substitui pela imagem)
#let vinheta-vertical(kicker) = box(width: 34mm, height: 210mm,
  fill: gradient.linear(rgb("#c9bda4"), rgb("#b1a589"), rgb("#9c9078"), angle: 118deg))[
  #place(center + horizon, rotate(-90deg, reflow: false,
    box(width: 180mm, align(center, text(font: sans, fill: rgb("#efe7d6"), size: 6.6pt, tracking: 0.34em)[IMAGEM · #upper(kicker)]))))
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

// normaliza o campo destaque (string ou lista) numa lista de pull-quotes
#let norm-dest(u) = {
  if "destaque" not in u { return () }
  let d = u.destaque
  if type(d) == array { d } else { (d,) }
}

// corpo que RESPIRA: capitular opcional + quebras de movimento nas viragens.
// Em cada viragem entra um DESTAQUE (pull-quote), enquanto houver; as restantes
// viragens ficam só com o losango. Assim os destaques aparecem VÁRIAS vezes.
#let corpo-paras(paras, dropcap-on: true, destaques: ()) = {
  set par(first-line-indent: (amount: 5mm, all: true))
  let n = paras.len()
  let breaks = ()
  let k = 6
  while k <= n - 3 { breaks.push(k); k += 6 }
  // garante viragens suficientes para os destaques, mesmo em capítulos curtos
  while breaks.len() < destaques.len() and breaks.len() + 1 <= n - 2 {
    let pos = calc.floor(n * (breaks.len() + 1) / (destaques.len() + 1))
    if not breaks.contains(pos) and pos >= 2 { breaks.push(pos) } else { break }
  }
  breaks = breaks.sorted()
  let di = 0
  for (i, p) in paras.enumerate() {
    if breaks.contains(i) {
      if di < destaques.len() { destaque(destaques.at(di)); di += 1 }
      else { movbreak() }
    }
    if i == 0 and dropcap-on {
      set par(first-line-indent: 0pt)
      [#dropcap(height: 3, gap: 2.6mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(p)]#parbreak()]
    } else [#fmt(p)#parbreak()]
  }
}

// ---- voz (carta de 2150 / interlúdios): a CARTA vai DENTRO do arco ----
// O arco delicado emoldura a coluna da carta na 1.ª página; o texto desce por
// dentro dele. Nas páginas seguintes a coluna continua, sem repetir o arco.
// a carta de 2150: um SINAL (anéis concêntricos) com um brilho suave; sem arco.
#let abre-voz(u, tam: 28pt) = {
  setsect(u.kicker)
  pagebreak()
  set align(center)
  v(46mm)
  {
    set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    set text(hyphenate: false)
    text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.36em)[#upper(u.kicker)]
    v(5mm)
    text(font: display, fill: TITLEINK, size: tam, weight: 300)[#u.titulo]
    if "epigrafe" in u { v(7mm); block(width: 72%, text(font: serif, style: "italic", fill: BROWN, size: 11pt)[#u.epigrafe]) }
  }
  v(9mm)
  hairline(w: 20mm)
  v(10mm)
  block(width: 92mm)[
    #set align(left)
    #set par(justify: false, first-line-indent: 0pt, leading: 0.92em, spacing: 1.5em)
    #set text(size: 10.5pt, fill: INK)
    #for p in u.texto [#fmt(p)#parbreak()]
  ]
}

// ---- abertura com IMAGEM vertical a sangrar pela margem ----
// partU != none => abre também a Parte por cima do capítulo. Serve a abertura de
// Parte (1.º capítulo) e a Introdução (sem Parte, mas com imagem própria).
#let abre-imagem(u, partU: none) = {
  let etiqueta = if partU != none { partU.kicker } else { u.kicker }
  setsect(if partU != none { partU.titulo } else { u.kicker })
  page(margin: (left: 50mm, right: 16mm, top: 22mm, bottom: 18mm), header: none, footer: footer-num)[
    #place(top + left, dx: -50mm, dy: -22mm, vinheta-vertical(etiqueta))
    #set align(left)
    #set text(hyphenate: false)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #if partU != none {
      text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.34em)[#upper(partU.kicker)]
      v(3.5mm)
      text(font: display, fill: TITLEINK, size: 19pt, weight: 300)[#upper(partU.titulo)]
      v(7mm)
      hairline(w: 24mm)
      v(9mm)
    }
    #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.34em)[#upper(u.kicker)]
    #v(3.5mm)
    #text(font: display, fill: TITLEINK, size: 18pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(5mm)
      mini-rule(w: 14mm)
      v(2.5mm)
      text(font: serif, style: "italic", fill: BROWN, size: 10.5pt)[#u.epigrafe]
    }
    #v(8mm)
    #set par(justify: true, first-line-indent: 0pt)
    #dropcap(height: 3, gap: 2.6mm, justify: true, font: display, fill: TITLEINK, weight: 400)[#fmt(u.texto.first())]
  ]
  // o resto do capítulo, largura plena, a respirar
  corpo-paras(u.texto.slice(1), dropcap-on: false, destaques: norm-dest(u))
}

// ---- capítulo seguinte (não abre Parte): sem imagem, sem arco ----
// sect: nome para o cabeçalho corrente (Introdução/Epílogo); none => herda a Parte.
#let abre-cap(u, sect: none) = {
  pagebreak()
  if sect != none { setsect(sect) }
  v(46mm) // RESPIRO: o título começa bem abaixo do topo
  block(below: 11mm)[
    #set align(left)
    #set par(justify: false, first-line-indent: 0pt, spacing: 0pt)
    #set text(hyphenate: false)
    // etiqueta pequena, em sans + ouro (hierarquia clara face ao título)
    #text(font: sans, fill: GOLDSOFT, size: 8.5pt, weight: 500, tracking: 0.36em)[#upper(u.kicker)]
    #v(5mm)
    // título grande, em display (claramente diferente da etiqueta)
    #text(font: display, fill: TITLEINK, size: 24pt, weight: 300)[#u.titulo]
    #if "epigrafe" in u {
      v(6mm)
      mini-rule(w: 16mm)
      v(3.5mm)
      block(width: 78%, text(font: serif, style: "italic", fill: BROWN, size: 10.5pt)[#u.epigrafe])
    }
  ]
  corpo-paras(u.texto, dropcap-on: true, destaques: norm-dest(u))
}

// SISTEMA SEMÂNTICO — sistema/icone definidos no topo; aqui só os blocos.
// um BLOCO de qualquer tipo do sistema (hipótese, pergunta, dica, arquivo…)
#let bloco(chave, corpo, italico: false) = {
  let s = sistema.at(chave)
  let c = rgb(s.cor)
  let cabecalho = grid(columns: (auto, auto), column-gutter: 3.5mm, align: (horizon, horizon),
    box(width: 7mm, line(length: 7mm, stroke: 0.8pt + c)),
    text(font: sans, fill: c, size: 7.6pt, weight: 500, tracking: 0.3em)[#upper(s.rotulo)])
  let corpo-txt = if italico {
    text(font: serif, style: "italic", fill: BROWN, size: 13pt)[#fmt(corpo)]
  } else { text(fill: TITLEINK, size: 10.5pt)[#fmt(corpo)] }
  block(breakable: false, width: 100%, above: 11mm, below: 3mm)[
    #set par(justify: false, first-line-indent: 0pt, leading: 0.9em, spacing: 1.0em)
    #if s.moldura == "orbital" {
      block(width: 100%, fill: c.transparentize(93%), inset: (x: 11mm, y: 9mm))[
        #cabecalho #v(5mm) #corpo-txt]
    } else if s.moldura == "nota" {
      block(width: 100%, inset: (left: 6mm), stroke: (left: 0.6pt + c.transparentize(20%)))[
        #cabecalho #v(3mm) #corpo-txt]
    } else if s.moldura == "arquivo" {
      block(width: 100%, inset: (y: 6mm), stroke: (top: 0.5pt + c.transparentize(15%), bottom: 0.5pt + c.transparentize(15%)))[
        #cabecalho #v(4mm) #corpo-txt]
    } else { // aberta
      cabecalho; v(3mm); block(width: 88%, corpo-txt)
    }
  ]
}

// fecho do capítulo em página própria, CENTRADO na vertical (ar à volta).
#let aparato(u) = {
  if ("ideia" in u) or ("dica" in u) or ("pergunta" in u) {
    pagebreak()
    v(1fr)
    if "ideia" in u { bloco("hipotese", u.ideia) }
    if "dica" in u { bloco("dica", u.dica) }
    if "pergunta" in u { bloco("pergunta", u.pergunta, italico: true) }
    v(1.05fr)
  }
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
    #v(4mm)
    #block(width: 92mm, text(font: serif, style: "italic", fill: SOFT, size: 10pt)[
      O caminho que este livro percorre: da sobrevivência, pela fissura, à emergência.
    ])
    #v(7mm)
    #rule-orn()
    #v(10mm)
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
    abre-imagem(u)               // voz da autora, com imagem própria (sem Parte)
    aparato(u)
  } else if u.tipo == "capitulo" {
    if pendente-parte != none {
      abre-imagem(u, partU: pendente-parte)
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
