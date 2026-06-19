// Método VS · ECOSSISTEMA DE PERSONAGENS — a matéria-prima do reconhecimento.
//
// INVERSÃO DE EIXO (descoberta com a Vivianne): uma mulher não se reconhece em
// "Esforço". Reconhece-se em "sou a que resolve tudo antes de me pedirem". Por isso:
//   família (o coração) -> personagem (a máscara) -> véu (o mecanismo) -> conta (o gesto)
//
//   - PERSONAGEM = QUEM (o reconhecimento, "és tu") -> matéria-prima.
//   - VÉU        = PORQUÊ (o mecanismo que mantém a máscara viva) -> lente (saber.ts).
//   - CONTA      = COMO (o gesto/alívio: ver/vir/viver/voz) -> tratamento.
//
// A anatomia do reel mapeia nisto: HOOK = personagem · RAIZ = véu · VOLTA = conta.
// A CRENÇA da família é a versão mais funda do hook ("se eu largar, tudo cai").
//
// As personagens ATRAVESSAM vários véus (a Salvadora vive no Esforço, na Desolação,
// na Memória...). É isso que dá variedade infinita sem repetir. Não é uma lista
// para crescer ao infinito: são 5 FAMÍLIAS nucleares (o ecossistema).
//
// NOTA (tunável pela Vivianne): o `tier` (núcleo/segunda/proteção) e os `veus` de
// cada personagem são a 1.ª proposta, para afinar. As frases e a sombra são dela.

import type { VeuNome } from './contas';

export type FamiliaId = 'carregar' | 'procurar' | 'desaparecer' | 'adaptar' | 'vigiar';
/** Hierarquia (aposta da Vivianne): o coração do VS são as que CARREGAM, as que
 *  PROCURAM e as que DESAPARECERAM de si; as outras são estratégias de sobrevivência. */
export type Tier = 'nucleo' | 'segunda' | 'protecao';

export interface Personagem {
  id: string;
  nome: string;        // "A Salvadora"
  essencia: string;    // uma linha (quem é)
  frases: string[];    // o que ela diz (a voz que se reconhece)
  sombra: string;      // o custo invisível
  veus: VeuNome[];     // os véus que esta máscara atravessa (o mecanismo por baixo)
}

export interface Familia {
  id: FamiliaId;
  nome: string;
  tier: Tier;
  /** a crença invisível que segura a família (o hook mais fundo). */
  crenca: string;
  medo: string;
  fraseTipica: string;
  personagens: Personagem[];
}

export const FAMILIAS: Familia[] = [
  {
    id: 'carregar',
    nome: 'As que carregam',
    tier: 'nucleo',
    crenca: 'Se eu largar, tudo cai.',
    medo: 'Não ser necessária.',
    fraseTipica: 'Eu trato.',
    personagens: [
      { id: 'salvadora', nome: 'A Salvadora', essencia: 'Não suporta ver alguém em sofrimento; assume os problemas dos outros antes de lhos pedirem.', frases: ['Se eu não fizer, quem faz?', 'Eu resolvo.', 'Deixa comigo.'], sombra: 'Confunde amor com resgate.', veus: ['Esforço', 'Desolação', 'Memória', 'Dualidade'] },
      { id: 'diretora', nome: 'A Diretora Invisível', essencia: 'A gestora da operação: não faz tudo, mas sabe tudo e centraliza.', frases: ['Já tratei.', 'Já confirmei.', 'Já marquei.'], sombra: 'Não consegue desligar o cérebro.', veus: ['Esforço', 'Turbilhão', 'Horizonte', 'Desolação'] },
      { id: 'provedora', nome: 'A Provedora', essencia: 'O valor dela está colado ao que entrega; garante que não falte nada a ninguém.', frases: ['O importante é que não falte nada.', 'Eu trato.'], sombra: 'Receber parece dívida.', veus: ['Esforço', 'Permanência', 'Desolação'] },
      { id: 'heroina', nome: 'A Heroína', essencia: 'Excelente nas crises; aparece quando há problema e fica estranhamente calma.', frases: ['Quando dá problema, eu apareço.', 'Nessas alturas fico calma.'], sombra: 'A paz deixa-a sem função.', veus: ['Esforço', 'Turbilhão', 'Permanência'] },
      { id: 'indispensavel', nome: 'A Indispensável', essencia: 'Diz que está cansada, mas precisa de ser precisa.', frases: ['Eu faço mais depressa.', 'Deixa que eu trato.'], sombra: 'O lugar dela depende da utilidade; confunde controlo com amor.', veus: ['Esforço', 'Permanência', 'Desolação'] },
    ],
  },
  {
    id: 'procurar',
    nome: 'As que procuram',
    tier: 'nucleo',
    crenca: 'Falta qualquer coisa.',
    medo: 'Parar e descobrir que já chegou.',
    fraseTipica: 'Ainda não encontrei.',
    personagens: [
      { id: 'peregrina', nome: 'A Peregrina', essencia: 'Está sempre à procura: outro curso, outro método, outra explicação.', frases: ['Falta qualquer coisa.', 'Ainda não encontrei.'], sombra: 'Procura fora o que talvez esteja dentro.', veus: ['Horizonte', 'Dualidade', 'Desolação'] },
      { id: 'navegadora', nome: 'A Navegadora', essencia: 'Não procura respostas, procura significado em tudo o que lhe acontece.', frases: ['O que é que isto me está a ensinar?', 'Porque é que isto me aconteceu?'], sombra: 'Às vezes interpreta de mais.', veus: ['Horizonte', 'Memória', 'Dualidade'] },
      { id: 'aluna-eterna', nome: 'A Aluna Eterna', essencia: 'Cursos, certificações, livros: sempre mais uma coisa para aprender antes de começar.', frases: ['Ainda não estou pronta.', 'Preciso de estudar mais um pouco.'], sombra: 'Transforma preparação em adiamento.', veus: ['Horizonte', 'Esforço', 'Permanência'] },
      { id: 'buscadora-casa', nome: 'A Buscadora de Casa', essencia: 'Não procura sucesso nem amor: procura casa, pertença, descanso.', frases: ['Quero sentir que pertenço.', 'Quero finalmente descansar.'], sombra: 'Procura fora uma casa interior.', veus: ['Dualidade', 'Horizonte', 'Desolação'] },
    ],
  },
  {
    id: 'desaparecer',
    nome: 'As que desaparecem',
    tier: 'nucleo',
    crenca: 'Não ocupes espaço.',
    medo: 'Ser demasiado.',
    fraseTipica: 'Ninguém pergunta por mim.',
    personagens: [
      { id: 'invisivel', nome: 'A Invisível', essencia: 'Faz tudo e queixa-se de que ninguém repara; reivindica em voz alta o lugar que não toma.', frases: ['Já reparaste que sou eu que me lembro de toda a gente?', 'Ninguém pergunta por mim.'], sombra: 'Passa a vida à espera de ser vista, e diz isso a toda a gente menos a si.', veus: ['Desolação', 'Dualidade', 'Esforço'] },
      { id: 'desaparecida', nome: 'A Desaparecida', essencia: 'Cuidou tanto da vida de todos que perdeu o contacto consigo (muito nos 40-55).', frases: ['Já nem sei do que gosto.', 'Passaram-se anos.'], sombra: 'Cuidou tanto da vida que se perdeu nela.', veus: ['Desolação', 'Horizonte', 'Permanência'] },
      { id: 'orfa', nome: 'A Órfã', essencia: 'Mesmo com família, parceiro e amigos, sente que no fundo está sozinha.', frases: ['No fundo, estou sozinha.', 'Não sei se alguém fica.'], sombra: 'Nunca acredita totalmente que alguém fique.', veus: ['Dualidade', 'Memória', 'Desolação'] },
      { id: 'rebelde-silenciosa', nome: 'A Rebelde Silenciosa', essencia: 'Cumpre tudo, mas por dentro quer fugir; tem tudo e continua inquieta.', frases: ['Era suposto sentir-me feliz.', 'Tenho tudo e continuo inquieta.'], sombra: 'Sente culpa pela própria insatisfação.', veus: ['Permanência', 'Horizonte', 'Desolação'] },
    ],
  },
  {
    id: 'adaptar',
    nome: 'As que se adaptam',
    tier: 'segunda',
    crenca: 'Para ser amada, tenho de caber.',
    medo: 'Desagradar.',
    fraseTipica: 'Para mim, tanto faz.',
    personagens: [
      { id: 'adaptadora', nome: 'A Adaptadora', essencia: 'Muda de forma para caber: uma com o marido, outra no trabalho, outra com a mãe.', frases: ['Para mim, tanto faz.', 'Eu adapto-me.'], sombra: 'Já não sabe o que quer.', veus: ['Dualidade', 'Memória', 'Permanência'] },
      { id: 'tradutora', nome: 'A Tradutora', essencia: 'Traduz as emoções, intenções e conflitos de todos.', frases: ['O que ele quis dizer foi...', 'Ela não fez por mal.'], sombra: 'Ninguém traduz a dela.', veus: ['Dualidade', 'Turbilhão', 'Esforço'] },
      { id: 'diplomata', nome: 'A Diplomata', essencia: 'Mantém a paz, evita o conflito, traduz todos os lados.', frases: ['Eu percebo os dois.', 'Não vale a pena discutir.'], sombra: 'Nunca toma partido de si própria.', veus: ['Dualidade', 'Permanência', 'Esforço'] },
      { id: 'fiel', nome: 'A Fiel', essencia: 'Lealdade acima de tudo: à família, à empresa, à relação.', frases: ['Não posso abandonar.', 'Depois de tudo o que fizeram por mim.'], sombra: 'Confunde gratidão com prisão.', veus: ['Memória', 'Permanência'] },
    ],
  },
  {
    id: 'vigiar',
    nome: 'As que vigiam',
    tier: 'protecao',
    crenca: 'Se eu relaxar, alguma coisa corre mal.',
    medo: 'Perder o controlo.',
    fraseTipica: 'Só para garantir.',
    personagens: [
      { id: 'guardia', nome: 'A Guardiã', essencia: 'Está sempre atenta, em antecipação constante.', frases: ['Só para garantir.', 'Vou confirmar outra vez.'], sombra: 'Nunca se sente verdadeiramente segura.', veus: ['Turbilhão', 'Memória', 'Desolação'] },
      { id: 'sentinela', nome: 'A Sentinela', essencia: 'Nunca desarma, nunca baixa a guarda.', frases: ['Só para prevenir.', 'Mais vale estar preparada.'], sombra: 'Confunde segurança com vigilância.', veus: ['Turbilhão', 'Memória'] },
      { id: 'perfeccionista', nome: 'A Perfeccionista Silenciosa', essencia: 'Não procura aplausos, procura ausência de falhas.', frases: ['Ainda não está pronto.', 'Só falta corrigir isto.'], sombra: 'Nunca chega.', veus: ['Turbilhão', 'Esforço', 'Permanência'] },
      { id: 'observadora', nome: 'A Observadora', essencia: 'Vê tudo, lê a sala inteira, percebe os padrões.', frases: ['Eu já tinha percebido.', 'Sabia que isto ia acontecer.'], sombra: 'Observa tanto que deixa de participar.', veus: ['Turbilhão', 'Dualidade', 'Memória'] },
    ],
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
export const PERSONAGENS: Personagem[] = FAMILIAS.flatMap((f) => f.personagens);

export const getFamilia = (id: string): Familia | undefined => FAMILIAS.find((f) => f.id === id);
export const getPersonagem = (id: string): Personagem | undefined => PERSONAGENS.find((p) => p.id === id);
export const familiaDaPersonagem = (id: string): Familia | undefined => FAMILIAS.find((f) => f.personagens.some((p) => p.id === id));

/** As personagens que atravessam um véu (para a geração rodar máscaras por véu). */
export const personagensPorVeu = (veu: VeuNome): Personagem[] => PERSONAGENS.filter((p) => p.veus.includes(veu));

/** As famílias de um tier (núcleo primeiro, para priorizar o coração do VS). */
export const familiasPorTier = (tier: Tier): Familia[] => FAMILIAS.filter((f) => f.tier === tier);
