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
  palavra: string;       // palavra-capa (UPPERCASE no render)
  subtitulo: string;     // linha poetica sob a palavra
  tema: string;          // titulo legivel (palavra + nuance)
  universo: ColecaoId;   // alinha o CTA ao ecossistema
  musica: string;        // instrumental da semana (estilo Ancient Ground)
  brief: string;         // orienta o gerador
};

const MESES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function mesDaSemana(semana: number): string {
  return MESES[Math.min(11, Math.floor((semana - 1) / (52 / 12)))];
}
function estacaoDaSemana(semana: number): Estacao {
  // Hemisferio norte (Portugal), aproximado por semana.
  if (semana <= 11 || semana >= 50) return 'inverno';
  if (semana <= 24) return 'primavera';
  if (semana <= 37) return 'verao';
  return 'outono';
}
const MUSICA: Record<Estacao, string> = {
  inverno: 'Ancient Ground — piano so e cordas graves, contemplativo e quente',
  primavera: 'Ancient Ground — piano e cordas, luz crescente, esperanca',
  verao: 'Ancient Ground — cordas amplas, expansivo e luminoso',
  outono: 'Ancient Ground — violoncelo e piano, dourado e nostalgico',
};

// Dados por semana: palavra + subtitulo + universo + brief. mes/estacao/musica
// sao derivados. Alinhado a estacoes e datas comemorativas PT.
type Seed = { palavra: string; subtitulo: string; universo: ColecaoId; brief: string };

const SEMANAS: Seed[] = [
  // ── INVERNO · recomeco e interioridade (Jan) ──
  { palavra: 'LIMIAR', subtitulo: 'o ano abre-se como uma porta que ainda nao atravessaste', universo: 'infonte', brief: 'Inicio de ano: nao metas, mas intencao. O limiar entre quem foste e quem comecas a ser.' },
  { palavra: 'RAIZ', subtitulo: 'o que te sustenta quando a superficie nao mostra nada', universo: 'pertenca', brief: 'No frio, a vida trabalha por baixo. As raizes que te seguram mesmo sem floricao visivel.' },
  { palavra: 'SILENCIO', subtitulo: 'ha respostas que so chegam quando paras de perguntar', universo: 'infonte', brief: 'O silencio do inverno como escuta. O que emerge quando o ruido baixa.' },
  { palavra: 'GESTACAO', subtitulo: 'o que se forma em ti antes de poder ser nomeado', universo: 'freeme-mae', brief: 'Aquilo que esta a nascer e ainda nao tem forma. Confiar no que cresce no escuro.' },
  { palavra: 'ABRIGO', subtitulo: 'pertencer e ter onde voltar, mesmo dentro de ti', universo: 'pertenca', brief: 'O abrigo interior. O lugar dentro de ti que nao depende de ser escolhida la fora.' },
  // ── INVERNO · vinculo (Fev · Dia dos Namorados) ──
  { palavra: 'ENCONTRO', subtitulo: 'amar e deixar-te ser vista sem te perderes', universo: 'amor', brief: 'Semana do amor (14 Fev): o encontro que nao pede que desaparecas. Apego vs intimidade.' },
  { palavra: 'ENTREGA', subtitulo: 'a pedra polida pelo rio nao resistiu a agua', universo: 'amor', brief: 'Entregar-se sem se anular. Suavidade como coragem no vinculo.' },
  { palavra: 'TRAVESSIA', subtitulo: 'atravessar o escuro tambem e um modo de avancar', universo: 'forca', brief: 'O fim do inverno como travessia. Dor que ninguem viu, passo a passo.' },
  { palavra: 'FE', subtitulo: 'fe nao e certeza, e continuar mesmo sem mapa', universo: 'forca', brief: 'Confiar no processo sem o ver completo. Fe como entrega ao desconhecido.' },
  // ── INVERNO->PRIMAVERA · transicao (Mar · Dia do Pai 19) ──
  { palavra: 'HERANCA', subtitulo: 'o que carregas sem saber de quem o recebeste', universo: 'pertenca', brief: 'Mes de Marco / Dia do Pai: o que herdamos do sistema familiar, masculino e feminino.' },
  { palavra: 'DESPERTAR', subtitulo: 'algo em ti volta a mexer antes da primeira flor', universo: 'infonte', brief: 'Limiar da primavera: o desejo que volta a acordar. Identidade que pede movimento.' },
  // ── PRIMAVERA · abertura (Abr) ──
  { palavra: 'BROTO', subtitulo: 'o que nasce e fragil, e ainda assim insiste', universo: 'forca', brief: 'Primavera: a forca do que e novo e fragil. Resiliencia suave.' },
  { palavra: 'PERDAO', subtitulo: 'pousar nao e esquecer, e parar de carregar', universo: 'freeme-mae', brief: 'Soltar o peso que nao e teu. Perdao como leveza, nao como aprovacao.' },
  { palavra: 'VOZ', subtitulo: 'dizer nao a algo que te esvazia e dizer sim a ti', universo: 'infonte', brief: 'Recuperar a voz propria. Fronteiras como cuidado, nao egoismo.' },
  { palavra: 'LEVEZA', subtitulo: 'o peso de querer ter feito mais, pousa aqui', universo: 'freeme-mae', brief: 'A leveza possivel quando deixas de te exigir o impossivel.' },
  // ── PRIMAVERA · Dia da Mae (1o domingo de Maio) ──
  { palavra: 'COLO', subtitulo: 'a mae que cuida tambem precisou de colo', universo: 'freeme-mae', brief: 'Vespera do Dia da Mae: a mae que nunca foi vista. Reparar a linha materna.' },
  { palavra: 'MAE', subtitulo: 'ser mae e continuar a ser ela', universo: 'freeme-mae', brief: 'Dia da Mae: a mulher que existe dentro da mae. Culpa herdada e o eu que nao desaparece.' },
  { palavra: 'DESEJO', subtitulo: 'o que queres quando ninguem espera nada de ti', universo: 'infonte', brief: 'Distinguir o teu desejo do herdado. O proposito por baixo da expectativa.' },
  { palavra: 'CORAGEM', subtitulo: 'florir e expor-te ao que te pode tocar', universo: 'forca', brief: 'Plena primavera: a coragem de ser vista, de abrir. Vulnerabilidade como forca.' },
  // ── PRIMAVERA->VERAO (Jun · Santos Populares) ──
  { palavra: 'PRESENCA', subtitulo: 'a tua presenca e nectar, nao a desperdices a agradar', universo: 'amor', brief: 'Presenca em vez de agradar. Estar inteira na relacao.' },
  { palavra: 'FOGUEIRA', subtitulo: 'ha um calor que so se acende em comunidade', universo: 'pertenca', brief: 'Santos Populares: pertenca, festa, o calor de pertencer a um lugar.' },
  { palavra: 'CORPO', subtitulo: 'hoje, no corpo, solto os ombros', universo: 'forca', brief: 'O verao chega ao corpo. O que o corpo guarda do que a mente calou.' },
  { palavra: 'VOCACAO', subtitulo: 'ocupar o teu tamanho sem pedir desculpa', universo: 'trabalho', brief: 'Meio do ano: vocacao por baixo da carreira. Habitar o teu lugar profissional.' },
  // ── VERAO · plenitude (Jul) ──
  { palavra: 'PLENITUDE', subtitulo: 'nem sempre falta — as vezes ja chega', universo: 'prosperidade', brief: 'Verao: a suficiencia. Reconhecer o que ja ha, em vez da escassez.' },
  { palavra: 'PRAZER', subtitulo: 'receber tambem se aprende', universo: 'prosperidade', brief: 'O medo de receber. Permitir o prazer, o descanso, a abundancia.' },
  { palavra: 'LUZ', subtitulo: 'celebro a versao de mim que nao desistiu', universo: 'forca', brief: 'Auge da luz: celebrar a travessia ja feita. Gratidao a quem foste.' },
  { palavra: 'LIBERDADE', subtitulo: 'dinheiro como escolha, nao como prova', universo: 'prosperidade', brief: 'Verao / ferias: liberdade. O valor que nao precisa de ser provado.' },
  // ── VERAO · descanso (Ago) ──
  { palavra: 'REPOUSO', subtitulo: 'descansar nao e parar de valer', universo: 'freeme-mae', brief: 'Mes de ferias: o direito ao descanso sem culpa.' },
  { palavra: 'AGUA', subtitulo: 'deixar-te levar tambem e confiar', universo: 'amor', brief: 'Verao, agua, entrega. Fluir no vinculo e na vida.' },
  { palavra: 'EXPANSAO', subtitulo: 'ha mais espaco em ti do que pensavas', universo: 'infonte', brief: 'Expansao da identidade. Crescer para o teu tamanho real.' },
  { palavra: 'ALEGRIA', subtitulo: 'a leveza tambem e um lugar serio', universo: 'prosperidade', brief: 'Alegria como abundancia emocional. Permitir o bom.' },
  { palavra: 'ENCONTRO-II', subtitulo: 'amar de menos tambem e uma ferida', universo: 'amor', brief: 'Fim do verao: a distancia que protege. Aproximar sem medo.' },
  // ── VERAO->OUTONO (Set · regresso) ──
  { palavra: 'REGRESSO', subtitulo: 'voltar a rotina sem te perder de vista', universo: 'trabalho', brief: 'Setembro / regresso: nao te perderes na engrenagem. Sentido no fazer.' },
  { palavra: 'SEMENTE', subtitulo: 'o que plantaste agora comeca a mostrar-se', universo: 'prosperidade', brief: 'Inicio da colheita. O que cresceu do que cuidaste.' },
  // ── OUTONO · colheita e desapego (Out) ──
  { palavra: 'COLHEITA', subtitulo: 'reconhece o que ja deste fruto', universo: 'prosperidade', brief: 'Outono: colher e agradecer. Valor proprio reconhecido.' },
  { palavra: 'GRATIDAO', subtitulo: 'quem foste ontem trouxe-te ate aqui', universo: 'pertenca', brief: 'Gratidao as versoes anteriores de ti. Pertencer a tua propria historia.' },
  { palavra: 'DESAPEGO', subtitulo: 'a arvore solta a folha para descansar', universo: 'freeme-mae', brief: 'Soltar o que ja cumpriu. Desapego como cuidado.' },
  { palavra: 'QUEDA', subtitulo: 'cair tambem faz parte de te renovares', universo: 'forca', brief: 'A queda da folha como metafora da travessia. Cair sem te perder.' },
  { palavra: 'MATURIDADE', subtitulo: 'firmeza nao e dureza', universo: 'trabalho', brief: 'Maturidade profissional e pessoal. Flexivel e firme.' },
  // ── OUTONO · interioridade (Nov · memoria) ──
  { palavra: 'MEMORIA', subtitulo: 'o que recordas tambem te constroi', universo: 'pertenca', brief: 'Novembro: memoria, ancestrais, os que vieram antes.' },
  { palavra: 'LUTO', subtitulo: 'ha perdas que nunca tiveram funeral', universo: 'forca', brief: 'O luto silencioso. Dar lugar e ritual ao que se perdeu sem ser visto.' },
  { palavra: 'INTERIOR', subtitulo: 'o nao-saber como forma de presenca', universo: 'infonte', brief: 'Interiorizar. Habitar o misterio sem o resolver.' },
  { palavra: 'MISTERIO', subtitulo: 'nao precisas de perceber tudo para continuares a confiar', universo: 'infonte', brief: 'O misterio como territorio a habitar, nao problema a resolver.' },
  { palavra: 'BALANCO', subtitulo: 'olhar para tras sem te julgares', universo: 'trabalho', brief: 'Fim do ciclo de trabalho: balanco gentil do ano.' },
  // ── OUTONO->INVERNO (Dez · encerramento e Natal) ──
  { palavra: 'ENTREGA-II', subtitulo: 'fechar tambem e um modo de cuidar', universo: 'amor', brief: 'Dezembro: encerrar relacoes e ciclos com cuidado.' },
  { palavra: 'ABRIGO-II', subtitulo: 'a casa que somos uns para os outros', universo: 'pertenca', brief: 'Aproximacao do Natal: pertenca, familia, o abrigo partilhado.' },
  { palavra: 'DADIVA', subtitulo: 'o maior presente e a presenca', universo: 'freeme-mae', brief: 'Natal: presenca em vez de prova. Dar do que se e, nao do que se tem.' },
  { palavra: 'PRESENCA-II', subtitulo: 'estar e o que fica quando o resto passa', universo: 'amor', brief: 'Semana de Natal: presenca plena com quem amas.' },
  { palavra: 'SOLSTICIO', subtitulo: 'a noite mais longa tambem anuncia a luz', universo: 'forca', brief: 'Solsticio de inverno: o ponto mais escuro que ja contem o regresso da luz.' },
  { palavra: 'RECOLHIMENTO', subtitulo: 'recolher-te para te ouvires', universo: 'infonte', brief: 'Entre-anos: recolhimento, silencio, escuta antes do novo ciclo.' },
  { palavra: 'GRATIDAO-ANO', subtitulo: 'agradecer o ano que te atravessou', universo: 'pertenca', brief: 'Ultima semana: gratidao ao ano inteiro. Fechar para reabrir.' },
];

export const CALENDARIO_ANUAL: WeekSeed[] = SEMANAS.map((s, i) => {
  const semana = i + 1;
  const estacao = estacaoDaSemana(semana);
  const palavraTitulo = s.palavra.replace(/-I+$/,'').charAt(0) + s.palavra.replace(/-I+$/,'').slice(1).toLowerCase();
  return {
    semana,
    mes: mesDaSemana(semana),
    estacao,
    palavra: s.palavra.replace(/-I+$/, ''),
    subtitulo: s.subtitulo,
    tema: palavraTitulo,
    universo: s.universo,
    musica: MUSICA[estacao],
    brief: s.brief,
  };
});

export function semanaSeed(n: number): WeekSeed | undefined {
  return CALENDARIO_ANUAL.find((w) => w.semana === n);
}
