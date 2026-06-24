// Sequência de cartas do funil do Amparo (a oferta → os romances pagos).
// São CARTAS da Vivianne, não emails de venda: tom literário, sem pressa, sem
// barulho (a promessa feita no email de entrega). Cada uma com UM link claro e
// reversão de risco (o capítulo 1 lê-se sempre sem pagar nada). O cron
// (/api/cron/funil-amparo) envia a carta devida a cada leitora, por dias desde
// a inscrição. NADA é enviado até FUNIL_SEQUENCIA_ATIVA=1 e só a quem entrou
// depois de FUNIL_DESDE (a lista antiga nunca é tocada).
const SITE = 'https://viviannedossantos.com';

export type Carta = {
  dia: number; // dias após a inscrição (created_at) em que esta carta é devida
  pt: { assunto: string; corpo: string };
  en: { assunto: string; corpo: string };
};

const btn = (href: string, label: string) =>
  `<p style="text-align:center;margin:30px 0"><a href="${href}" style="display:inline-block;background:#8C4A36;color:#FFFDF9;text-decoration:none;font-size:15px;padding:13px 28px;border-radius:24px">${label}</a></p>`;

// As cartas. dia 0 = email de entrega (já enviado por /api/romance-gratis); a
// sequência são os seguimentos, espaçados para não fazer barulho.
export const SEQUENCIA: Carta[] = [
  {
    dia: 4,
    pt: {
      assunto: 'A Amparo ficou contigo?',
      corpo: `
  <p>Há uns dias deixei nas tuas mãos <em>As Mãos de Amparo</em>, e fiquei a pensar se a Amparo ficou contigo, como fica comigo cada vez que volto àquelas mãos que seguram toda a gente e a quem ninguém segura.</p>
  <p>Escrevo estas histórias de dentro, não de fora. Cada uma nasceu de uma ferida real e do caminho de volta a partir dela. A da Amparo é a de quem carrega todos e se esquece de que também precisa de colo.</p>
  <p>Hoje não te escrevo para te vender nada. Escrevo só para te dizer que, se aquele livro te tocou nalgum sítio, é porque há ali uma vila inteira à tua espera, e cada casa dela guarda uma história que é, no fundo, a de alguém que conheces. Talvez tu.</p>`,
    },
    en: {
      assunto: 'Did Amparo stay with you?',
      corpo: `
  <p>A few days ago I left <em>Amparo's Hands</em> in your hands, and I have been wondering whether Amparo stayed with you, as she stays with me each time I return to those hands that hold everyone and that no one holds.</p>
  <p>I write these stories from the inside, not the outside. Each was born of a real wound and the way back from it. Amparo's is the wound of one who carries everyone and forgets she too needs to be held.</p>
  <p>I am not writing to sell you anything today. Only to say that if that book touched you somewhere, it is because there is a whole village waiting for you, and every house in it keeps a story that is, at heart, that of someone you know. Perhaps you.</p>`,
    },
  },
  {
    dia: 9,
    pt: {
      assunto: 'Se a Amparo te tocou, conhece a Socorro',
      corpo: `
  <p>Prometi escrever-te quando houvesse algo verdadeiro para dizer. Hoje há.</p>
  <p>Se a Amparo te tocou, a mãe que segura todos, há uma mulher na mesma vila que vais reconhecer: a Socorro. Chamaram-lhe assim, a que acode, e ela cumpriu o nome a vida inteira, sendo o socorro de toda a gente. Mas há uma coisa que a Socorro nunca aprendeu: receber. Quando lhe põem uma travessa de comida à porta, devolve-a cheia, com um bilhete a agradecer, porque uma vez, no ano em que mais precisou, contou com alguém e ficou a ver a porta vazia.</p>
  <p><em>As Travessas Devolvidas</em> é o livro dela. Podes ler o primeiro capítulo na página do livro, sem pagar nada, e ver se te puxa. Se puxar, o livro inteiro é teu por €12, na hora, em PDF.</p>
  ${btn(SITE + '/as-travessas-devolvidas', 'Ler o primeiro capítulo')}`,
    },
    en: {
      assunto: 'If Amparo touched you, meet Socorro',
      corpo: `
  <p>I promised to write to you when there was something true to say. Today there is.</p>
  <p>If Amparo touched you, the mother who holds everyone, there is a woman in the same village you will recognise: Socorro. They named her so, the one who comes to the rescue, and she fulfilled the name her whole life, being everyone's help. But there is one thing Socorro never learned: to receive. When a dish of food is left at her door, she returns it full, with a note of thanks, because once, in the year she most needed it, she counted on someone and was left looking at an empty door.</p>
  <p><em>The Returned Dishes</em> is her book. You can read the first chapter on the book's page, without paying anything, and see if it pulls you. If it does, the whole book is yours for €12, at once, as a PDF.</p>
  ${btn(SITE + '/en/as-travessas-devolvidas', 'Read the first chapter')}`,
    },
  },
  {
    dia: 16,
    pt: {
      assunto: 'Sete estantes, sete perguntas',
      corpo: `
  <p>A Biblioteca de Véspera é uma vila onde cada história é uma travessia, e cada estante faz uma pergunta.</p>
  <p>Há a mãe que salva e se esquece de si, a Amparo. Há a que dá tudo e não sabe receber, a Socorro. Há a que confunde intensidade com amor e tem medo do sossego, a Tranquilina, n'<em>A Trovoada</em>. Há a que se tornou indispensável e não sabe quem é sem o que faz, a Preciosa, n'<em>A Chave da Fábrica</em>.</p>
  <p>Não escrevi estas mulheres de fora. Escrevi-as de dentro. Se calhar uma delas és tu, ou alguém que amas. Cada romance custa €12, é teu para sempre, em PDF, e começa sempre por um capítulo que podes ler sem pagar nada.</p>
  ${btn(SITE + '/biblioteca', 'Ver a biblioteca inteira')}`,
    },
    en: {
      assunto: 'Seven shelves, seven questions',
      corpo: `
  <p>The Véspera Library is a village where every story is a crossing, and every shelf asks a question.</p>
  <p>There is the mother who saves and forgets herself, Amparo. The one who gives everything and cannot receive, Socorro. The one who confuses intensity with love and fears the calm, Tranquilina, in <em>The Thunderstorm</em>. The one who made herself indispensable and does not know who she is without what she does, Preciosa, in <em>The Key to the Mill</em>.</p>
  <p>I did not write these women from the outside. I wrote them from within. Perhaps one of them is you, or someone you love. Each novel is €12, yours forever, as a PDF, and always opens with a chapter you can read without paying anything.</p>
  ${btn(SITE + '/en/biblioteca', 'See the whole library')}`,
    },
  },
  {
    dia: 30,
    pt: {
      assunto: 'A vila fica aqui, quando quiseres',
      corpo: `
  <p>Esta é a última vez que te escrevo por uns tempos, para não fazer barulho.</p>
  <p>Só queria que soubesses que a Biblioteca de Véspera fica aqui, com a porta aberta, para quando te apetecer voltar. Os livros não vão a lado nenhum, e o primeiro capítulo de cada um está sempre lá para leres sem compromisso.</p>
  <p>Obrigada por teres deixado a Amparo entrar. Para mim, é tudo.</p>
  ${btn(SITE + '/biblioteca', 'A biblioteca')}`,
    },
    en: {
      assunto: 'The village stays here, whenever you wish',
      corpo: `
  <p>This is the last time I will write to you for a while, so as not to make noise.</p>
  <p>I only wanted you to know that the Véspera Library stays here, its door open, for whenever you feel like coming back. The books are not going anywhere, and the first chapter of each is always there to read with no commitment.</p>
  <p>Thank you for letting Amparo in. To me, it is everything.</p>
  ${btn(SITE + '/en/biblioteca', 'The library')}`,
    },
  },
];

// Embrulho da casa (mesmo registo do email de entrega), com rodapé de sair.
export function envelopar(corpo: string, sairUrl: string, lang: 'pt' | 'en'): string {
  return `
<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43;text-align:center;margin-bottom:30px">VIVIANNE DOS SANTOS</p>
  <div style="font-size:15px;line-height:1.85;color:#4A3525">${corpo}</div>
  <p style="font-size:14px;color:#9A5A43;text-align:center;margin-top:30px;font-style:italic">${lang === 'en' ? 'With warmth,<br>Vivianne' : 'Com carinho,<br>Vivianne'}</p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#B89A86;text-align:center">viviannedossantos.com · <a href="${sairUrl}" style="color:#B89A86">${lang === 'en' ? 'stop receiving these letters' : 'deixar de receber estas cartas'}</a></p>
</div>`;
}
