// Calendario anual dos Carrosseis dos 7 Veus — fusao do ritmo/alma dos 7 Veus
// (palavra-capa unica, subtitulo poetico, estacoes, datas, musica instrumental)
// com a consciencia de loja (universo -> CTA de ecossistema). 52 semanas.
//
// A "palavra" lidera cada semana (ex.: GESTACAO, FE, RAIZ). O universo alinha
// o tema da semana a uma coleccao da loja, para o CTA apontar produtos certos.
// Espinha proposta (estacoes + datas PT) — editavel semana a semana no admin.

import type { ColecaoId } from '@/lib/colecoes';

export type Estacao = 'inverno' | 'primavera' | 'verao' | 'outono';

export type WeekSeed = {
  semana: number;        // 1..52
  mes: string;
  estacao: Estacao;
  palavra: string;       // palavra-capa (UPPERCASE no render), acentuada
  subtitulo: string;     // linha poetica sob a palavra
  tema: string;          // titulo legivel (palavra em titlecase)
  universo: ColecaoId;   // alinha o CTA ao ecossistema
  musica: string;        // instrumental da semana (estilo Ancient Ground)
  brief: string;         // orienta o gerador
};

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function mesDaSemana(semana: number): string {
  return MESES[Math.min(11, Math.floor((semana - 1) / (52 / 12)))];
}
function estacaoDaSemana(semana: number): Estacao {
  if (semana <= 11 || semana >= 50) return 'inverno';
  if (semana <= 24) return 'primavera';
  if (semana <= 37) return 'verao';
  return 'outono';
}
const MUSICA: Record<Estacao, string> = {
  inverno: 'Ancient Ground — piano só e cordas graves, contemplativo e quente',
  primavera: 'Ancient Ground — piano e cordas, luz crescente, esperança',
  verao: 'Ancient Ground — cordas amplas, expansivo e luminoso',
  outono: 'Ancient Ground — violoncelo e piano, dourado e nostálgico',
};

// Titlecase preservando acentos.
function titlecase(palavra: string): string {
  return palavra.charAt(0) + palavra.slice(1).toLowerCase();
}

type Seed = { palavra: string; subtitulo: string; universo: ColecaoId; brief: string };

const SEMANAS: Seed[] = [
  // ── INVERNO · recomeço e interioridade (Jan) ──
  { palavra: 'LIMIAR', subtitulo: 'o ano abre-se como uma porta que ainda não atravessaste', universo: 'infonte', brief: 'Início de ano: não metas, mas intenção. O limiar entre quem foste e quem começas a ser.' },
  { palavra: 'RAIZ', subtitulo: 'o que te sustenta quando a superfície não mostra nada', universo: 'pertenca', brief: 'No frio, a vida trabalha por baixo. As raízes que te seguram mesmo sem floração visível.' },
  { palavra: 'SILÊNCIO', subtitulo: 'há respostas que só chegam quando paras de perguntar', universo: 'infonte', brief: 'O silêncio do inverno como escuta. O que emerge quando o ruído baixa.' },
  { palavra: 'GESTAÇÃO', subtitulo: 'o que se forma em ti antes de poder ser nomeado', universo: 'freeme-mae', brief: 'Aquilo que está a nascer e ainda não tem forma. Confiar no que cresce no escuro.' },
  { palavra: 'ABRIGO', subtitulo: 'pertencer é ter onde voltar, mesmo dentro de ti', universo: 'pertenca', brief: 'O abrigo interior. O lugar dentro de ti que não depende de ser escolhida lá fora.' },
  // ── INVERNO · vínculo (Fev · Dia dos Namorados) ──
  { palavra: 'ENCONTRO', subtitulo: 'amar é deixar-te ser vista sem te perderes', universo: 'amor', brief: 'Semana do amor (14 Fev): o encontro que não pede que desapareças. Apego vs intimidade.' },
  { palavra: 'ENTREGA', subtitulo: 'a pedra polida pelo rio não resistiu à água', universo: 'amor', brief: 'Entregar-se sem se anular. Suavidade como coragem no vínculo.' },
  { palavra: 'TRAVESSIA', subtitulo: 'atravessar o escuro também é um modo de avançar', universo: 'forca', brief: 'O fim do inverno como travessia. Dor que ninguém viu, passo a passo.' },
  { palavra: 'FÉ', subtitulo: 'fé não é certeza, é continuar mesmo sem mapa', universo: 'forca', brief: 'Confiar no processo sem o ver completo. Fé como entrega ao desconhecido.' },
  // ── INVERNO->PRIMAVERA · transição (Mar · Dia do Pai 19) ──
  { palavra: 'HERANÇA', subtitulo: 'o que carregas sem saber de quem o recebeste', universo: 'pertenca', brief: 'Mês de Março / Dia do Pai: o que herdamos do sistema familiar, masculino e feminino.' },
  { palavra: 'DESPERTAR', subtitulo: 'algo em ti volta a mexer antes da primeira flor', universo: 'infonte', brief: 'Limiar da primavera: o desejo que volta a acordar. Identidade que pede movimento.' },
  // ── PRIMAVERA · abertura (Abr) ──
  { palavra: 'BROTO', subtitulo: 'o que nasce é frágil, e ainda assim insiste', universo: 'forca', brief: 'Primavera: a força do que é novo e frágil. Resiliência suave.' },
  { palavra: 'PERDÃO', subtitulo: 'pousar não é esquecer, é parar de carregar', universo: 'freeme-mae', brief: 'Soltar o peso que não é teu. Perdão como leveza, não como aprovação.' },
  { palavra: 'VOZ', subtitulo: 'dizer não a algo que te esvazia é dizer sim a ti', universo: 'infonte', brief: 'Recuperar a voz própria. Fronteiras como cuidado, não egoísmo.' },
  { palavra: 'LEVEZA', subtitulo: 'o peso de querer ter feito mais, pousa aqui', universo: 'freeme-mae', brief: 'A leveza possível quando deixas de te exigir o impossível.' },
  // ── PRIMAVERA · Dia da Mãe (1º domingo de Maio) ──
  { palavra: 'COLO', subtitulo: 'a mãe que cuida também precisou de colo', universo: 'freeme-mae', brief: 'Véspera do Dia da Mãe: a mãe que nunca foi vista. Reparar a linha materna.' },
  { palavra: 'MÃE', subtitulo: 'ser mãe é continuar a ser ela', universo: 'freeme-mae', brief: 'Dia da Mãe: a mulher que existe dentro da mãe. Culpa herdada e o eu que não desaparece.' },
  { palavra: 'DESEJO', subtitulo: 'o que queres quando ninguém espera nada de ti', universo: 'infonte', brief: 'Distinguir o teu desejo do herdado. O propósito por baixo da expectativa.' },
  { palavra: 'CORAGEM', subtitulo: 'florir é expor-te ao que te pode tocar', universo: 'forca', brief: 'Plena primavera: a coragem de ser vista, de abrir. Vulnerabilidade como força.' },
  // ── PRIMAVERA->VERAO (Jun · Santos Populares) ──
  { palavra: 'PRESENÇA', subtitulo: 'a tua presença é néctar, não a desperdices a agradar', universo: 'amor', brief: 'Presença em vez de agradar. Estar inteira na relação.' },
  { palavra: 'FOGUEIRA', subtitulo: 'há um calor que só se acende em comunidade', universo: 'pertenca', brief: 'Santos Populares: pertença, festa, o calor de pertencer a um lugar.' },
  { palavra: 'CORPO', subtitulo: 'hoje, no corpo, solto os ombros', universo: 'forca', brief: 'O verão chega ao corpo. O que o corpo guarda do que a mente calou.' },
  { palavra: 'VOCAÇÃO', subtitulo: 'ocupar o teu tamanho sem pedir desculpa', universo: 'trabalho', brief: 'Meio do ano: vocação por baixo da carreira. Habitar o teu lugar profissional.' },
  // ── VERAO · plenitude (Jul) ──
  { palavra: 'PLENITUDE', subtitulo: 'nem sempre falta — às vezes já chega', universo: 'prosperidade', brief: 'Verão: a suficiência. Reconhecer o que já há, em vez da escassez.' },
  { palavra: 'PRAZER', subtitulo: 'receber também se aprende', universo: 'prosperidade', brief: 'O medo de receber. Permitir o prazer, o descanso, a abundância.' },
  { palavra: 'LUZ', subtitulo: 'celebro a versão de mim que não desistiu', universo: 'forca', brief: 'Auge da luz: celebrar a travessia já feita. Gratidão a quem foste.' },
  { palavra: 'LIBERDADE', subtitulo: 'dinheiro como escolha, não como prova', universo: 'prosperidade', brief: 'Verão / férias: liberdade. O valor que não precisa de ser provado.' },
  // ── VERAO · descanso (Ago) ──
  { palavra: 'REPOUSO', subtitulo: 'descansar não é parar de valer', universo: 'freeme-mae', brief: 'Mês de férias: o direito ao descanso sem culpa.' },
  { palavra: 'ÁGUA', subtitulo: 'deixar-te levar também é confiar', universo: 'amor', brief: 'Verão, água, entrega. Fluir no vínculo e na vida.' },
  { palavra: 'EXPANSÃO', subtitulo: 'há mais espaço em ti do que pensavas', universo: 'infonte', brief: 'Expansão da identidade. Crescer para o teu tamanho real.' },
  { palavra: 'ALEGRIA', subtitulo: 'a leveza também é um lugar sério', universo: 'prosperidade', brief: 'Alegria como abundância emocional. Permitir o bom.' },
  { palavra: 'ENCONTRO', subtitulo: 'amar de menos também é uma ferida', universo: 'amor', brief: 'Fim do verão: a distância que protege. Aproximar sem medo.' },
  // ── VERAO->OUTONO (Set · regresso) ──
  { palavra: 'REGRESSO', subtitulo: 'voltar à rotina sem te perder de vista', universo: 'trabalho', brief: 'Setembro / regresso: não te perderes na engrenagem. Sentido no fazer.' },
  { palavra: 'SEMENTE', subtitulo: 'o que plantaste agora começa a mostrar-se', universo: 'prosperidade', brief: 'Início da colheita. O que cresceu do que cuidaste.' },
  // ── OUTONO · colheita e desapego (Out) ──
  { palavra: 'COLHEITA', subtitulo: 'reconhece o que já deu fruto', universo: 'prosperidade', brief: 'Outono: colher e agradecer. Valor próprio reconhecido.' },
  { palavra: 'GRATIDÃO', subtitulo: 'quem foste ontem trouxe-te até aqui', universo: 'pertenca', brief: 'Gratidão às versões anteriores de ti. Pertencer à tua própria história.' },
  { palavra: 'DESAPEGO', subtitulo: 'a árvore solta a folha para descansar', universo: 'freeme-mae', brief: 'Soltar o que já cumpriu. Desapego como cuidado.' },
  { palavra: 'QUEDA', subtitulo: 'cair também faz parte de te renovares', universo: 'forca', brief: 'A queda da folha como metáfora da travessia. Cair sem te perder.' },
  { palavra: 'MATURIDADE', subtitulo: 'firmeza não é dureza', universo: 'trabalho', brief: 'Maturidade profissional e pessoal. Flexível e firme.' },
  // ── OUTONO · interioridade (Nov · memória) ──
  { palavra: 'MEMÓRIA', subtitulo: 'o que recordas também te constrói', universo: 'pertenca', brief: 'Novembro: memória, ancestrais, os que vieram antes.' },
  { palavra: 'LUTO', subtitulo: 'há perdas que nunca tiveram funeral', universo: 'forca', brief: 'O luto silencioso. Dar lugar e ritual ao que se perdeu sem ser visto.' },
  { palavra: 'INTERIOR', subtitulo: 'o não-saber como forma de presença', universo: 'infonte', brief: 'Interiorizar. Habitar o mistério sem o resolver.' },
  { palavra: 'MISTÉRIO', subtitulo: 'não precisas de perceber tudo para continuares a confiar', universo: 'infonte', brief: 'O mistério como território a habitar, não problema a resolver.' },
  { palavra: 'BALANÇO', subtitulo: 'olhar para trás sem te julgares', universo: 'trabalho', brief: 'Fim do ciclo de trabalho: balanço gentil do ano.' },
  // ── OUTONO->INVERNO (Dez · encerramento e Natal) ──
  { palavra: 'ENTREGA', subtitulo: 'fechar também é um modo de cuidar', universo: 'amor', brief: 'Dezembro: encerrar relações e ciclos com cuidado.' },
  { palavra: 'ABRIGO', subtitulo: 'a casa que somos uns para os outros', universo: 'pertenca', brief: 'Aproximação do Natal: pertença, família, o abrigo partilhado.' },
  { palavra: 'DÁDIVA', subtitulo: 'o maior presente é a presença', universo: 'freeme-mae', brief: 'Natal: presença em vez de prova. Dar do que se é, não do que se tem.' },
  { palavra: 'PRESENÇA', subtitulo: 'estar é o que fica quando o resto passa', universo: 'amor', brief: 'Semana de Natal: presença plena com quem amas.' },
  { palavra: 'SOLSTÍCIO', subtitulo: 'a noite mais longa também anuncia a luz', universo: 'forca', brief: 'Solstício de inverno: o ponto mais escuro que já contém o regresso da luz.' },
  { palavra: 'RECOLHIMENTO', subtitulo: 'recolher-te para te ouvires', universo: 'infonte', brief: 'Entre-anos: recolhimento, silêncio, escuta antes do novo ciclo.' },
  { palavra: 'GRATIDÃO', subtitulo: 'agradecer o ano que te atravessou', universo: 'pertenca', brief: 'Última semana: gratidão ao ano inteiro. Fechar para reabrir.' },
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
