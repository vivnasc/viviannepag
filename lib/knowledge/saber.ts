// GERADO por scripts/gen-knowledge.js a partir de knowledge/GLOSSARIO.md — NÃO editar à mão.
// Os 15 domínios das Ciências da Consciência Emergente (as palavras da Vivianne).
// Servem de PROFUNDIDADE POR BAIXO na geração (mãe/Soulab): dão rigor e densidade,
// mas NUNCA se nomeiam no texto que sai (sem jargão, sem autores, sem domínios).

export interface ConceitoSaber { nome: string; def: string }
export interface DominioSaber { codigo: string; nome: string; conceitos: ConceitoSaber[] }

// Os 7 Sinais de Desencaixe (livro "Os 7 Sinais de Desencaixe"): a experiência
// SENTIDA de pertencer sem deixar de se ser inteiro. Cada sinal traz a sua
// EPÍGRAFE (a frase sentida, palavras do livro). Profundidade da MÃE.
export interface SinalDesencaixe { nome: string; essencia: string }
export const SINAIS_DESENCAIXE: SinalDesencaixe[] = [
  {
    "nome": "Estás presente mas não te sentes pertencente",
    "essencia": "Estou aqui mas não estou em casa."
  },
  {
    "nome": "Começas a diminuir-te para caber",
    "essencia": "Talvez esteja a exagerar."
  },
  {
    "nome": "Sentes saudades de algo que nunca viveste",
    "essencia": "Há qualquer coisa que me falta mas não sei o quê."
  },
  {
    "nome": "Oscilas entre hiper-adaptação e isolamento",
    "essencia": "Ou pertenço ou sou eu."
  },
  {
    "nome": "O teu sistema nervoso começa a rejeitar certos ambientes",
    "essencia": "Não consigo mais."
  },
  {
    "nome": "Começas a confundir paz com ausência de pessoas",
    "essencia": "Talvez seja melhor sozinho."
  },
  {
    "nome": "Percebes que o problema nunca foi pertencer, mas o preço da pertença",
    "essencia": "Talvez eu só estivesse a pagar demasiado caro pela pertença."
  }
];

export const DOMINIOS: DominioSaber[] = [
  {
    "codigo": "D01",
    "nome": "Antropologia da Sobrevivência",
    "conceitos": [
      {
        "nome": "Identidade de Escassez",
        "def": "o eu construído sobre a falta, que se sente real sobretudo quando algo ameaça faltar."
      },
      {
        "nome": "Vigilância Permanente",
        "def": "o estado de alerta herdado, que continua a varrer o ambiente à procura de ameaça muito depois de a ameaça ter passado."
      },
      {
        "nome": "Economia do Medo",
        "def": "a gestão da vida como administração de perigos, em que cada decisão é, no fundo, uma defesa."
      },
      {
        "nome": "Tribo e Fronteira",
        "def": "a divisão entre os nossos e os outros como tecnologia de sobrevivência, e o seu custo actual."
      },
      {
        "nome": "Acumulação como Seguro",
        "def": "juntar para lá da necessidade como resposta corporal a uma fome que já não existe."
      },
      {
        "nome": "Hierarquia de Dominância",
        "def": "a ordenação por poder como forma antiga de reduzir o conflito, e a sua persistência fora do seu contexto."
      },
      {
        "nome": "Memória da Fome",
        "def": "o registo corporal e cultural da falta, que organiza o desejo e o medo mesmo na fartura."
      },
      {
        "nome": "Competição como Destino",
        "def": "a crença de que viver é disputar, lida como natureza quando talvez seja adaptação."
      }
    ]
  },
  {
    "codigo": "D02",
    "nome": "Psicologia Pós-Sobrevivência",
    "conceitos": [
      {
        "nome": "Sistema Nervoso em Segurança",
        "def": "o estado fisiológico em que o corpo deixa de gerir ameaça e fica disponível para outra coisa."
      },
      {
        "nome": "Identidade Pós-Defensiva",
        "def": "o eu que já não precisa de se proteger a tempo inteiro, e por isso pode ser poroso sem se sentir em risco."
      },
      {
        "nome": "Capacidade de Repouso",
        "def": "a competência, e não o acaso, de descansar sem culpa nem vigilância."
      },
      {
        "nome": "Desejo sem Urgência",
        "def": "querer a partir da plenitude e não da falta, sem a pressa que confunde desejo com fome."
      },
      {
        "nome": "Criatividade como Estado Base",
        "def": "a criação como modo natural de um sistema que já não está em defesa, não como talento de poucos."
      },
      {
        "nome": "Vínculo sem Medo",
        "def": "ligar-se sem que a proximidade active o alarme da perda ou da invasão."
      },
      {
        "nome": "Atenção Liberta",
        "def": "a atenção que deixa de ser sequestrada pela ameaça e pode pousar onde escolhe."
      },
      {
        "nome": "O Eu que Resta",
        "def": "a pergunta sobre quem fica quando a ameaça sai, e quanto do que chamávamos eu era defesa."
      }
    ]
  },
  {
    "codigo": "D03",
    "nome": "Ecologia das Lealdades Invisíveis",
    "conceitos": [
      {
        "nome": "Lealdade ao Esforço",
        "def": "a crença implícita de que só tem valor aquilo que custou sofrimento."
      },
      {
        "nome": "Lealdade ao Sofrimento",
        "def": "a fidelidade à dor como prova de seriedade, pertença ou amor."
      },
      {
        "nome": "Lealdade à Escassez",
        "def": "manter-se na falta porque a abundância pareceria traição a quem viveu na falta."
      },
      {
        "nome": "Lealdade à Exaustão",
        "def": "o cansaço como estado familiar e seguro, mais habitável do que o descanso."
      },
      {
        "nome": "Lealdade ao Sacrifício",
        "def": "dar até doer como condição silenciosa de pertencer."
      },
      {
        "nome": "Lealdade à Invisibilidade",
        "def": "apagar-se para não ameaçar, herdada de quem sobreviveu por não ser visto."
      },
      {
        "nome": "Lealdade ao Controlo",
        "def": "segurar tudo como única forma conhecida de segurança."
      },
      {
        "nome": "Lealdade à Identidade Herdada",
        "def": "ser quem os nossos foram, mesmo quando já não serve, para não os perder."
      }
    ]
  },
  {
    "codigo": "D04",
    "nome": "Arqueologia da Consciência",
    "conceitos": [
      {
        "nome": "O Culto da Urgência",
        "def": "a pressa como valor e como prova de importância, vista do futuro como rito estranho."
      },
      {
        "nome": "A Religião da Produtividade",
        "def": "o fazer como medida da dignidade, com os seus dogmas, pecados e penitências."
      },
      {
        "nome": "Os Artefactos da Pressa",
        "def": "os objectos que prometiam tempo e cobravam disponibilidade, lidos como relíquias."
      },
      {
        "nome": "A Doença do Tempo",
        "def": "a relação ansiosa com um tempo sempre escasso, estudada como sintoma de uma época."
      },
      {
        "nome": "O Trabalho como Identidade",
        "def": "a fusão entre quem se é e o que se produz, e o vazio quando o produzir pára."
      },
      {
        "nome": "A Ocupação Permanente",
        "def": "estar sempre ocupado como defesa contra algo que o silêncio traria à tona."
      },
      {
        "nome": "Os Rituais da Disponibilidade",
        "def": "a obrigação de estar sempre alcançável, lida do futuro como servidão voluntária."
      },
      {
        "nome": "A Métrica de Tudo",
        "def": "a compulsão de medir e quantificar a experiência até onde a medida a empobrece."
      }
    ]
  },
  {
    "codigo": "D05",
    "nome": "Cartografia da Consciência",
    "conceitos": [
      {
        "nome": "Os Estados Não Cartografados",
        "def": "as regiões da experiência que a cultura corrente não nomeia e por isso quase não vê."
      },
      {
        "nome": "O Espectro da Atenção",
        "def": "a atenção como território com muitos modos, não como interruptor de ligar e desligar."
      },
      {
        "nome": "As Camadas do Eu",
        "def": "os níveis sobrepostos de identidade, do mais defensivo ao mais aberto."
      },
      {
        "nome": "Os Limiares Internos",
        "def": "as fronteiras entre estados, onde a experiência muda de regime."
      },
      {
        "nome": "O Território do Silêncio",
        "def": "o que aparece quando o ruído pára, e porque o evitamos."
      },
      {
        "nome": "As Geografias do Sonho",
        "def": "o sonho como continente de experiência com a sua própria lógica e cartografia."
      },
      {
        "nome": "O Continente do Corpo",
        "def": "o corpo como lugar de saber e de estados, não como veículo da cabeça."
      },
      {
        "nome": "As Fronteiras da Percepção",
        "def": "os limites do que conseguimos perceber, e o que fica do lado de fora deles."
      }
    ]
  },
  {
    "codigo": "D06",
    "nome": "Fenomenologia da Emergência",
    "conceitos": [
      {
        "nome": "A Fissura",
        "def": "a primeira fenda na identidade antiga, o sinal de que já não organiza a experiência."
      },
      {
        "nome": "O Colapso Organizador",
        "def": "o momento em que o eu que segurava tudo deixa de conseguir segurar."
      },
      {
        "nome": "O Vazio Fértil",
        "def": "o espaço sem forma que se abre entre uma identidade que cai e outra que ainda não nasceu."
      },
      {
        "nome": "A Desorientação Necessária",
        "def": "a perda de mapa como condição, e não como falha, da emergência."
      },
      {
        "nome": "O Limiar Sem Mapa",
        "def": "a travessia que não tem instruções porque é a primeira vez."
      },
      {
        "nome": "A Identidade Provisória",
        "def": "a forma temporária que se habita enquanto a nova ainda se organiza."
      },
      {
        "nome": "O Reconhecimento",
        "def": "o instante em que a forma nova se vê pela primeira vez como possível."
      },
      {
        "nome": "A Reorganização",
        "def": "o assentar de uma nova maneira de organizar a experiência, mais ampla do que a anterior."
      }
    ]
  },
  {
    "codigo": "D07",
    "nome": "Arquitectura da Consciência",
    "conceitos": [
      {
        "nome": "O Espaço como Estado",
        "def": "a hipótese de que cada espaço produz um estado interno antes de qualquer pensamento."
      },
      {
        "nome": "A Luz que Organiza",
        "def": "a luz como agente que dispõe a atenção, o tempo e o humor."
      },
      {
        "nome": "O Limiar Construído",
        "def": "as portas, soleiras e passagens como dispositivos de mudança de estado."
      },
      {
        "nome": "A Escala e o Eu",
        "def": "a relação de tamanho entre o humano e a estrutura, que produz humildade ou esmagamento."
      },
      {
        "nome": "O Vazio Habitável",
        "def": "o espaço deixado vazio de propósito, que respira e acolhe em vez de exigir."
      },
      {
        "nome": "A Forma que Acalma",
        "def": "as formas que baixam o alarme do sistema nervoso por geometria e não por decoração."
      },
      {
        "nome": "A Geometria da Pertença",
        "def": "a disposição do espaço que diz a um corpo se pertence ali."
      },
      {
        "nome": "O Abrigo e o Horizonte",
        "def": "a necessidade dupla de recolhimento seguro e de vista aberta, e o seu equilíbrio."
      }
    ]
  },
  {
    "codigo": "D08",
    "nome": "Biologia da Pertença",
    "conceitos": [
      {
        "nome": "O Sistema Nervoso Social",
        "def": "o sistema nervoso lido como órgão de relação, afinado para ler e responder a outros corpos."
      },
      {
        "nome": "A Co-Regulação",
        "def": "a regulação do estado interno através da presença de outro, anterior à auto-regulação."
      },
      {
        "nome": "O Medo da Exclusão",
        "def": "a exclusão social registada pelo corpo como ameaça de morte, porque um dia foi."
      },
      {
        "nome": "O Vínculo como Necessidade",
        "def": "o laço como necessidade fisiológica, não como luxo emocional."
      },
      {
        "nome": "A Sincronia dos Corpos",
        "def": "a tendência dos corpos para se sincronizarem em ritmo, respiração e estado."
      },
      {
        "nome": "A Solidão como Alarme",
        "def": "a solidão como sinal biológico de perigo, e não apenas como tristeza."
      },
      {
        "nome": "A Segurança Relacional",
        "def": "o estado em que a presença do outro acalma em vez de alertar, base de quase tudo."
      },
      {
        "nome": "O Pertencer Antes do Eu",
        "def": "a hipótese, com raiz africana, de que a pertença antecede e constitui o eu."
      }
    ]
  },
  {
    "codigo": "D09",
    "nome": "Estudos do Significado",
    "conceitos": [
      {
        "nome": "A Necessidade de Sentido",
        "def": "o sentido como necessidade estrutural do humano, não como acrescento opcional."
      },
      {
        "nome": "O Significado como Sobrevivência",
        "def": "a leitura, ancorada em Frankl, de que o significado pode decidir quem sobrevive."
      },
      {
        "nome": "As Fontes do Sentido",
        "def": "os lugares de onde o sentido brota, da relação à criação, ao serviço e à transcendência."
      },
      {
        "nome": "O Sentido que Evolui",
        "def": "a forma como aquilo que dá sentido muda ao longo do desenvolvimento de uma pessoa."
      },
      {
        "nome": "O Vazio de Significado",
        "def": "o estado de quem tem tudo e não encontra para quê, sintoma central da época."
      },
      {
        "nome": "A Narrativa que Organiza",
        "def": "a história que damos à nossa vida como estrutura que produz sentido."
      },
      {
        "nome": "O Significado Partilhado",
        "def": "o sentido que só existe em comum, tecido entre pessoas e não dentro de uma."
      },
      {
        "nome": "O Sentido para Além do Eu",
        "def": "o significado que aparece quando o centro deixa de ser o próprio."
      }
    ]
  },
  {
    "codigo": "D10",
    "nome": "Estudos da Civilização Emergente",
    "conceitos": [
      {
        "nome": "As Instituições Pós-Escassez",
        "def": "as formas de organização que nascem quando a escassez deixa de ser o problema central."
      },
      {
        "nome": "A Economia do Significado",
        "def": "uma economia que mede valor por sentido criado, não só por bens acumulados."
      },
      {
        "nome": "O Conhecimento Cooperativo",
        "def": "o saber produzido em comum e em aberto, em vez de capturado e fechado."
      },
      {
        "nome": "A Governação da Interdependência",
        "def": "formas de decidir que partem da ligação entre todos, não da soma de interesses isolados."
      },
      {
        "nome": "O Trabalho Recriado",
        "def": "o trabalho desligado da sobrevivência e religado ao sentido e à contribuição."
      },
      {
        "nome": "A Educação da Consciência",
        "def": "uma educação que cultiva estados, atenção e maturação, não só competências."
      },
      {
        "nome": "As Novas Formas de Pertença",
        "def": "comunidades de pertença escolhida que não regressam à tribo fechada."
      },
      {
        "nome": "A Cultura da Criação",
        "def": "uma cultura organizada em torno do criar e não do defender ou do acumular."
      }
    ]
  },
  {
    "codigo": "D11",
    "nome": "Epigenética Narrativa",
    "conceitos": [
      {
        "nome": "A História que se Herda",
        "def": "as narrativas familiares e culturais que se transmitem como se fossem natureza."
      },
      {
        "nome": "O Segredo Transmitido",
        "def": "o que não se conta mas se herda, e age com mais força por ser oculto."
      },
      {
        "nome": "O Trauma Geracional",
        "def": "a marca de um acontecimento que atravessa gerações sem ser falado."
      },
      {
        "nome": "O Guião Familiar",
        "def": "o papel atribuído antes de nascer, que uma vida cumpre sem o saber."
      },
      {
        "nome": "A Lealdade Narrativa",
        "def": "a fidelidade à história da família, mesmo quando custa a vida própria."
      },
      {
        "nome": "O Não-Dito",
        "def": "o silêncio carregado que organiza um sistema mais do que qualquer palavra."
      },
      {
        "nome": "A Reparação Transgeracional",
        "def": "o gesto de uma geração que solta o que veio antes sem o trair."
      },
      {
        "nome": "A Ancestralidade Viva",
        "def": "a presença activa de quem veio antes, lida com raiz africana como facto e não metáfora."
      }
    ]
  },
  {
    "codigo": "D12",
    "nome": "Antropologia da Consciência",
    "conceitos": [
      {
        "nome": "As Cosmovisões da Consciência",
        "def": "as diferentes formas como as culturas concebem o que é estar consciente."
      },
      {
        "nome": "O Tempo Cultural",
        "def": "o tempo como construção cultural, linear ou cíclico, e o efeito disso na experiência."
      },
      {
        "nome": "Os Estados Rituais",
        "def": "os estados de consciência produzidos por ritual, reconhecidos e cultivados por uma cultura."
      },
      {
        "nome": "A Consciência Colectiva",
        "def": "a experiência de uma consciência que é mais do grupo do que do indivíduo."
      },
      {
        "nome": "As Tecnologias do Sagrado",
        "def": "as práticas que as culturas desenvolveram para alterar e orientar a consciência."
      },
      {
        "nome": "O Eu Poroso e o Eu Fechado",
        "def": "a distinção entre um eu permeável ao mundo e um eu selado, ancorada em Taylor."
      },
      {
        "nome": "As Cartografias Indígenas",
        "def": "os mapas de consciência das tradições indígenas, com o seu próprio rigor."
      },
      {
        "nome": "A Consciência Ancestral",
        "def": "a consciência que inclui os antepassados como parte de quem percebe, com raiz africana."
      }
    ]
  },
  {
    "codigo": "D13",
    "nome": "Espiritualidade do Desenvolvimento",
    "conceitos": [
      {
        "nome": "Os Estádios da Maturação",
        "def": "a hipótese de que a consciência amadurece por estádios, não só por acúmulo de experiência."
      },
      {
        "nome": "A Compaixão que se Desenvolve",
        "def": "a compaixão como capacidade que se treina e amplia, não como traço fixo."
      },
      {
        "nome": "A Percepção Treinável",
        "def": "a percepção como faculdade que se afina com prática, abrindo o que antes não se via."
      },
      {
        "nome": "O Ego e o que o Excede",
        "def": "a relação entre o centro organizador do eu e aquilo que o ultrapassa sem o destruir."
      },
      {
        "nome": "As Linhas de Desenvolvimento",
        "def": "a ideia de que se cresce de forma desigual em diferentes linhas, sem um único eixo."
      },
      {
        "nome": "A Espiritualidade Sem Crença",
        "def": "uma maturação espiritual que não depende de adesão a uma metafísica."
      },
      {
        "nome": "A Sabedoria como Estádio",
        "def": "a sabedoria entendida como estádio possível de desenvolvimento, não como sorte da idade."
      },
      {
        "nome": "A Integração das Sombras",
        "def": "o trabalho de reintegrar o que se excluiu de si, ancorado em Jung."
      }
    ]
  },
  {
    "codigo": "D14",
    "nome": "Ecologia dos Sistemas Humanos",
    "conceitos": [
      {
        "nome": "O Sistema que se Auto-Organiza",
        "def": "a família, o grupo e a sociedade como sistemas vivos que se produzem a si mesmos."
      },
      {
        "nome": "A Homeostase do Grupo",
        "def": "a tendência de um sistema para manter o seu equilíbrio, mesmo à custa de quem o compõe."
      },
      {
        "nome": "O Bode Expiatório",
        "def": "a função sistémica de concentrar numa pessoa a tensão de todo o grupo."
      },
      {
        "nome": "Os Laços de Realimentação",
        "def": "os circuitos pelos quais um sistema se corrige ou se amplifica."
      },
      {
        "nome": "A Emergência Colectiva",
        "def": "as propriedades que surgem do conjunto e não existem em nenhuma das partes."
      },
      {
        "nome": "O Campo do Sistema",
        "def": "o ambiente relacional partilhado que influencia cada membro antes de qualquer escolha."
      },
      {
        "nome": "As Regras Invisíveis",
        "def": "as normas tácitas que governam um sistema sem nunca terem sido ditas."
      },
      {
        "nome": "A Diferenciação",
        "def": "a capacidade de pertencer a um sistema sem se dissolver nele, ancorada em Bowen."
      }
    ]
  },
  {
    "codigo": "D15",
    "nome": "Estudos da Transição Civilizacional",
    "conceitos": [
      {
        "nome": "A Passagem",
        "def": "a travessia entre a civilização da sobrevivência e a da emergência, lida como rito de passagem em escala."
      },
      {
        "nome": "O Ponto de Bifurcação",
        "def": "o momento, ancorado em Prigogine, em que um sistema longe do equilíbrio salta para outra ordem."
      },
      {
        "nome": "A Janela de Tolerância Colectiva",
        "def": "a margem dentro da qual um colectivo consegue mudar sem entrar em pânico ou colapso."
      },
      {
        "nome": "As Pontes que Nascem ao Avançar",
        "def": "a imagem de que o caminho da transição não existe antes de ser percorrido."
      },
      {
        "nome": "O Luto da Forma Antiga",
        "def": "o luto necessário pela identidade e pelo mundo que se deixam para trás."
      },
      {
        "nome": "A Massa Crítica",
        "def": "o limiar de adesão a partir do qual uma nova forma se torna a norma."
      },
      {
        "nome": "Os Guardiões do Limiar",
        "def": "as forças, internas e sociais, que protegem a passagem e cobram o preço de entrar."
      },
      {
        "nome": "A Segurança na Travessia",
        "def": "as condições que permitem atravessar a transição sem se despedaçar no caminho."
      }
    ]
  }
];

// uma FATIA rotativa de domínios (por seed) -> profundidade variada por peça, sem
// encher o prompt nem repetir. n = quantos domínios; devolve um bloco de texto pronto
// a injetar como "para pensares mais fundo". NUNCA nomear isto no resultado.
export function profundidadePorBaixo(seed = 0, n = 3): string {
  const L = DOMINIOS.length;
  const inicio = ((seed % L) + L) % L;
  const escolhidos = Array.from({ length: Math.min(n, L) }, (_, k) => DOMINIOS[(inicio + k * 5) % L]);
  return escolhidos
    .map((d) => d.conceitos.map((c) => `${c.nome}: ${c.def}`).join(' · '))
    .join('\n');
}
