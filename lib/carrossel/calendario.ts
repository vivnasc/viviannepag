// Calendario anual dos Carrosseis dos 7 Veus — HEMISFERIO SUL.
// Cada semana e um TERRITORIO (universo + estacao + tema). Cada DIA gera a sua
// propria palavra-destaque unica (no gerador). Datas comemorativas no mes certo;
// estacoes do hemisferio sul (verao em Dez-Fev, inverno em Jun-Ago).

import type { ColecaoId } from '@/lib/colecoes';

export type Estacao = 'inverno' | 'primavera' | 'verao' | 'outono';

export type WeekSeed = {
  semana: number;
  mes: string;
  estacao: Estacao;
  palavra: string;       // ancora do territorio (titulo da semana)
  subtitulo: string;
  tema: string;          // titlecase do ancora
  universo: ColecaoId;
  musica: string;
  brief: string;
};

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Primeira segunda-feira do ano (semana 1 comeca aqui).
function primeiraSegunda(ano: number): Date {
  const d = new Date(Date.UTC(ano, 0, 1));
  const dow = d.getUTCDay() || 7; // 1=2a ... 7=Dom
  if (dow !== 1) d.setUTCDate(d.getUTCDate() + (8 - dow));
  return d;
}

// Intervalo de datas de uma semana (ex.: "8–14 Jun" ou "29 Jun–5 Jul").
export function intervaloDatas(semana: number, ano: number): string {
  const ini = primeiraSegunda(ano);
  ini.setUTCDate(ini.getUTCDate() + (semana - 1) * 7);
  const fim = new Date(ini);
  fim.setUTCDate(ini.getUTCDate() + 6);
  const di = ini.getUTCDate(), df = fim.getUTCDate();
  const mi = MESES_CURTOS[ini.getUTCMonth()], mf = MESES_CURTOS[fim.getUTCMonth()];
  return mi === mf ? `${di}–${df} ${mi}` : `${di} ${mi}–${df} ${mf}`;
}

// Data (YYYY-MM-DD) da segunda-feira da semana — para agendar no Metricool.
export function dataInicioSemana(semana: number, ano: number): string {
  const ini = primeiraSegunda(ano);
  ini.setUTCDate(ini.getUTCDate() + (semana - 1) * 7);
  return ini.toISOString().slice(0, 10);
}

function mesDaSemana(semana: number): string {
  return MESES[Math.min(11, Math.floor((semana - 1) / (52 / 12)))];
}
function estacaoDaSemana(semana: number): Estacao {
  // HEMISFERIO SUL: Dez-Fev verao, Mar-Mai outono, Jun-Ago inverno, Set-Nov primavera.
  if (semana <= 9 || semana >= 49) return 'verao';
  if (semana <= 22) return 'outono';
  if (semana <= 35) return 'inverno';
  return 'primavera';
}
const MUSICA: Record<Estacao, string> = {
  verao: 'Ancient Ground — cordas amplas, expansivo e luminoso',
  outono: 'Ancient Ground — violoncelo e piano, dourado e nostálgico',
  inverno: 'Ancient Ground — piano só e cordas graves, contemplativo e quente',
  primavera: 'Ancient Ground — piano e cordas, luz crescente, esperança',
};

function titlecase(palavra: string): string {
  return palavra.charAt(0) + palavra.slice(1).toLowerCase();
}

type Seed = { palavra: string; subtitulo: string; universo: ColecaoId; brief: string };

const SEMANAS: Seed[] = [
  // ── VERÃO · Janeiro-Fevereiro (luz, corpo, presença, amor) ──
  { palavra: 'LIMIAR', subtitulo: 'o ano abre-se como uma porta que ainda não atravessaste', universo: 'infonte', brief: 'Início de ano em pleno verão: intenção, não metas. O limiar entre quem foste e quem começas a ser.' },
  { palavra: 'LUZ', subtitulo: 'celebro a versão de mim que chegou até aqui', universo: 'forca', brief: 'Auge do verão e da luz: celebrar a travessia já feita, gratidão a quem foste.' },
  { palavra: 'PRESENÇA', subtitulo: 'a tua presença é néctar, não a desperdices a agradar', universo: 'amor', brief: 'Verão, estar inteira. Presença em vez de agradar.' },
  { palavra: 'CORPO', subtitulo: 'o verão habita o corpo, solta os ombros', universo: 'forca', brief: 'O calor chega ao corpo. O que o corpo guarda do que a mente calou.' },
  { palavra: 'PRAZER', subtitulo: 'receber também se aprende', universo: 'prosperidade', brief: 'Permitir o prazer, o descanso, a abundância. O medo de receber.' },
  { palavra: 'ENCONTRO', subtitulo: 'amar é deixar-te ser vista sem te perderes', universo: 'amor', brief: 'Mês dos namorados (14 Fev): o encontro que não pede que desapareças. Apego vs intimidade.' },
  { palavra: 'ENTREGA', subtitulo: 'a pedra polida pelo rio não resistiu à água', universo: 'amor', brief: 'Namorados: entregar-se sem se anular. Suavidade como coragem no vínculo.' },
  { palavra: 'LIBERDADE', subtitulo: 'escolher, não provar', universo: 'prosperidade', brief: 'Verão e férias: liberdade. O valor que não precisa de ser provado.' },
  { palavra: 'ÁGUA', subtitulo: 'deixar-te levar também é confiar', universo: 'amor', brief: 'Verão, água, entrega. Fluir no vínculo e na vida.' },
  // ── OUTONO · Março-Maio (colheita, desapego, gratidão, mãe) ──
  { palavra: 'HERANÇA', subtitulo: 'o que carregas sem saber de quem o recebeste', universo: 'pertenca', brief: 'Março / Dia do Pai: o que herdamos do sistema familiar, masculino e feminino.' },
  { palavra: 'COLHEITA', subtitulo: 'reconhece o que já deu fruto', universo: 'prosperidade', brief: 'Início do outono: colher e agradecer. Valor próprio reconhecido.' },
  { palavra: 'DESAPEGO', subtitulo: 'a árvore solta a folha para descansar', universo: 'freeme-mae', brief: 'Soltar o que já cumpriu. Desapego como cuidado.' },
  { palavra: 'GRATIDÃO', subtitulo: 'quem foste ontem trouxe-te até aqui', universo: 'pertenca', brief: 'Gratidão às versões anteriores de ti. Pertencer à tua própria história.' },
  { palavra: 'MATURIDADE', subtitulo: 'firmeza não é dureza', universo: 'trabalho', brief: 'Maturidade pessoal e profissional. Flexível e firme.' },
  { palavra: 'SEMENTE', subtitulo: 'o que plantaste começa a mostrar-se', universo: 'prosperidade', brief: 'O que cresceu do que cuidaste. A colheita que continua.' },
  { palavra: 'QUEDA', subtitulo: 'cair também faz parte de te renovares', universo: 'forca', brief: 'A queda da folha como travessia. Cair sem te perder.' },
  { palavra: 'COLO', subtitulo: 'a mãe que cuida também precisou de colo', universo: 'freeme-mae', brief: 'Véspera do Dia da Mãe: a mãe que nunca foi vista. Reparar a linha materna.' },
  { palavra: 'MÃE', subtitulo: 'ser mãe é continuar a ser ela', universo: 'freeme-mae', brief: 'Dia da Mãe (Maio): a mulher que existe dentro da mãe. Culpa herdada e o eu que não desaparece.' },
  { palavra: 'PERDÃO', subtitulo: 'pousar não é esquecer, é parar de carregar', universo: 'freeme-mae', brief: 'Soltar o peso que não é teu. Perdão como leveza, não como aprovação.' },
  { palavra: 'MEMÓRIA', subtitulo: 'o que recordas também te constrói', universo: 'pertenca', brief: 'Outono, interioridade: memória, ancestrais, os que vieram antes.' },
  { palavra: 'BALANÇO', subtitulo: 'olhar para trás sem te julgares', universo: 'trabalho', brief: 'Balanço gentil do meio do ano de trabalho.' },
  { palavra: 'LEVEZA', subtitulo: 'o peso de querer ter feito mais, pousa aqui', universo: 'freeme-mae', brief: 'A leveza possível quando deixas de te exigir o impossível.' },
  // ── INVERNO · Junho-Agosto (introspecção, raiz, mistério, travessia) ──
  { palavra: 'SOLSTÍCIO', subtitulo: 'a noite mais longa também anuncia a luz', universo: 'forca', brief: 'Solstício de inverno (Junho): o ponto mais escuro que já contém o regresso da luz.' },
  { palavra: 'SILÊNCIO', subtitulo: 'há respostas que só chegam quando paras de perguntar', universo: 'infonte', brief: 'O silêncio do inverno como escuta. O que emerge quando o ruído baixa.' },
  { palavra: 'RAIZ', subtitulo: 'o que te sustenta quando a superfície não mostra nada', universo: 'pertenca', brief: 'No frio, a vida trabalha por baixo. As raízes que te seguram mesmo sem floração visível.' },
  { palavra: 'ABRIGO', subtitulo: 'pertencer é ter onde voltar, mesmo dentro de ti', universo: 'pertenca', brief: 'O abrigo interior. O lugar dentro de ti que não depende de ser escolhida lá fora.' },
  { palavra: 'GESTAÇÃO', subtitulo: 'o que se forma em ti antes de poder ser nomeado', universo: 'freeme-mae', brief: 'Aquilo que está a nascer no escuro e ainda não tem forma. Confiar no que cresce.' },
  { palavra: 'INTERIOR', subtitulo: 'o não-saber como forma de presença', universo: 'infonte', brief: 'Interiorizar. Habitar o mistério sem o resolver.' },
  { palavra: 'MISTÉRIO', subtitulo: 'não precisas de perceber tudo para continuares a confiar', universo: 'infonte', brief: 'O mistério como território a habitar, não problema a resolver.' },
  { palavra: 'TRAVESSIA', subtitulo: 'atravessar o escuro também é um modo de avançar', universo: 'forca', brief: 'A travessia que ninguém vê. Dor que ninguém viu, passo a passo.' },
  { palavra: 'FÉ', subtitulo: 'fé não é certeza, é continuar mesmo sem mapa', universo: 'forca', brief: 'Confiar no processo sem o ver completo. Fé como entrega ao desconhecido.' },
  { palavra: 'LUTO', subtitulo: 'há perdas que nunca tiveram funeral', universo: 'forca', brief: 'O luto silencioso. Dar lugar e ritual ao que se perdeu sem ser visto.' },
  { palavra: 'REPOUSO', subtitulo: 'descansar não é parar de valer', universo: 'freeme-mae', brief: 'O direito ao descanso sem culpa, no recolhimento do inverno.' },
  { palavra: 'RECOLHIMENTO', subtitulo: 'recolher-te para te ouvires', universo: 'infonte', brief: 'Silêncio e escuta no coração do inverno.' },
  { palavra: 'VAZIO', subtitulo: 'o espaço fértil antes do que ainda não nasceu', universo: 'infonte', brief: 'O vazio não como falta, mas como ventre.' },
  // ── PRIMAVERA · Setembro-Novembro (despertar, coragem, voz, vocação) ──
  { palavra: 'DESPERTAR', subtitulo: 'algo em ti volta a mexer antes da primeira flor', universo: 'infonte', brief: 'Limiar da primavera: o desejo que volta a acordar. Identidade que pede movimento.' },
  { palavra: 'BROTO', subtitulo: 'o que nasce é frágil, e ainda assim insiste', universo: 'forca', brief: 'A força do que é novo e frágil. Resiliência suave.' },
  { palavra: 'DESEJO', subtitulo: 'o que queres quando ninguém espera nada de ti', universo: 'infonte', brief: 'Distinguir o teu desejo do herdado. O propósito por baixo da expectativa.' },
  { palavra: 'VOZ', subtitulo: 'dizer não a algo que te esvazia é dizer sim a ti', universo: 'infonte', brief: 'Recuperar a voz própria. Fronteiras como cuidado, não egoísmo.' },
  { palavra: 'CORAGEM', subtitulo: 'florir é expor-te ao que te pode tocar', universo: 'forca', brief: 'A coragem de ser vista, de abrir. Vulnerabilidade como força.' },
  { palavra: 'EXPANSÃO', subtitulo: 'há mais espaço em ti do que pensavas', universo: 'infonte', brief: 'Expansão da identidade. Crescer para o teu tamanho real.' },
  { palavra: 'VOCAÇÃO', subtitulo: 'ocupar o teu tamanho sem pedir desculpa', universo: 'trabalho', brief: 'Vocação por baixo da carreira. Habitar o teu lugar profissional.' },
  { palavra: 'FLORESCER', subtitulo: 'abrir-te é também deixares-te ver', universo: 'forca', brief: 'Plena primavera: florescer, mostrar-se ao que te toca.' },
  { palavra: 'ALEGRIA', subtitulo: 'a leveza também é um lugar sério', universo: 'prosperidade', brief: 'Alegria como abundância emocional. Permitir o bom.' },
  { palavra: 'MOVIMENTO', subtitulo: 'o desejo que finalmente pede corpo', universo: 'infonte', brief: 'A primavera pede ação. Mover-se na direção do que é teu.' },
  { palavra: 'FOGUEIRA', subtitulo: 'há um calor que só se acende em comunidade', universo: 'pertenca', brief: 'Pertença, festa, o calor de pertencer a um lugar.' },
  { palavra: 'ABERTURA', subtitulo: 'receber o que vem sem fechar as mãos', universo: 'amor', brief: 'Abrir ao novo, ao outro, ao que floresce.' },
  // ── VERÃO · Dezembro (Natal, presença, fecho do ano) ──
  { palavra: 'PLENITUDE', subtitulo: 'nem sempre falta — às vezes já chega', universo: 'prosperidade', brief: 'Fim da primavera, a caminho do verão: a suficiência. Reconhecer o que já há, em vez da escassez.' },
  { palavra: 'REUNIÃO', subtitulo: 'a casa que somos uns para os outros', universo: 'pertenca', brief: 'Aproximação do Natal: pertença, família, o abrigo partilhado.' },
  { palavra: 'DÁDIVA', subtitulo: 'o maior presente é a presença', universo: 'freeme-mae', brief: 'Natal: presença em vez de prova. Dar do que se é, não do que se tem.' },
  { palavra: 'COMUNHÃO', subtitulo: 'estar é o que fica quando o resto passa', universo: 'amor', brief: 'Semana de Natal: presença plena com quem amas.' },
  { palavra: 'FECHO', subtitulo: 'fechar também é cuidar — fechar para reabrir', universo: 'infonte', brief: 'Última semana: gratidão ao ano inteiro. Encerrar para o novo ciclo.' },
];

export const CALENDARIO_ANUAL: WeekSeed[] = SEMANAS.map((s, i) => {
  const semana = i + 1;
  const estacao = estacaoDaSemana(semana);
  return {
    semana,
    mes: mesDaSemana(semana),
    estacao,
    palavra: s.palavra,
    subtitulo: s.subtitulo,
    tema: titlecase(s.palavra),
    universo: s.universo,
    musica: MUSICA[estacao],
    brief: s.brief,
  };
});

export function semanaSeed(n: number): WeekSeed | undefined {
  return CALENDARIO_ANUAL.find((w) => w.semana === n);
}
