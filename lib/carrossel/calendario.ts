// Calendario anual de carrosseis: 52 semanas, cada uma com um universo, um
// tema e um brief para o gerador. Construido a partir de bancos de temas por
// universo (compacto e editavel) e expandido em rotacao pelas semanas do ano.

import type { ColecaoId } from '@/lib/colecoes';

export type WeekSeed = {
  semana: number;        // 1..52
  mes: string;
  universo: ColecaoId;
  tema: string;
  brief: string;         // 1-3 linhas que orientam o Claude
  veus: string[];        // angulos/temas dos dias da semana
};

const MESES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Ordem de rotacao dos universos ao longo do ano.
const ROTACAO: ColecaoId[] = ['freeme-mae', 'infonte', 'amor', 'forca', 'prosperidade', 'pertenca', 'trabalho'];

type Tema = { tema: string; brief: string; veus: string[] };

const TEMAS: Record<ColecaoId, Tema[]> = {
  'freeme-mae': [
    { tema: 'A culpa que nao tem origem', brief: 'A culpa materna nao nasceu contigo — e herdada. Lealdades invisiveis que passam de mae para filha.', veus: ['origem', 'heranca', 'silencio', 'compensar', 'lealdade', 'pousar', 'nome'] },
    { tema: 'Ser mae e continuar a ser ela', brief: 'A mulher que desaparece dentro da mae. Recuperar o eu que existia antes dos filhos.', veus: ['desaparecer', 'nome proprio', 'desejo', 'tempo', 'corpo', 'voz', 'regressar'] },
    { tema: 'O peso que nao e teu', brief: 'Aquilo que carregas em nome da familia. O que se pousa quando percebes o que e teu.', veus: ['mochila', 'fronteira', 'devolver', 'leveza', 'mae da mae', 'limite', 'descanso'] },
    { tema: 'A mae que nunca foi vista', brief: 'A propria mae que nao recebeu cuidado. A ferida que se repete sem se nomear.', veus: ['ausencia', 'reparar', 'olhar', 'ciclo', 'ternura', 'corte', 'novo'] },
  ],
  infonte: [
    { tema: 'A voz que decide o que conta', brief: 'A voz interna que mede tudo e nunca chega. De quem e essa voz e o que valida.', veus: ['voz', 'medida', 'suficiente', 'origem', 'silenciar', 'criterio', 'paz'] },
    { tema: 'Metas que nao sao tuas', brief: 'Perseguir o que outros quiseram para ti. Distinguir o teu desejo do herdado.', veus: ['mapa', 'desejo', 'heranca', 'parar', 'escolha', 'direccao', 'verdade'] },
    { tema: 'Quem es alem do que fazes', brief: 'Identidade colada a produtividade. O que resta quando paras.', veus: ['fazer', 'ser', 'pausa', 'vazio', 'valor', 'presenca', 'ser'] },
    { tema: 'O ruido e o que emerge no silencio', brief: 'Quando o ruido para, ouve-se o proposito. A clareza que so aparece na quietude.', veus: ['ruido', 'quietude', 'escuta', 'clareza', 'chamado', 'rumo', 'inteiro'] },
  ],
  amor: [
    { tema: 'Amar demais ou de menos', brief: 'O apego que se confunde com amor. Os extremos que protegem da intimidade real.', veus: ['apego', 'distancia', 'medo', 'fome', 'fuga', 'encontro', 'presenca'] },
    { tema: 'A ferida que escolhe o parceiro', brief: 'Repetir o mesmo amor com rostos diferentes. O padrao que vem de tras.', veus: ['padrao', 'familiar', 'repetir', 'reconhecer', 'corte', 'novo', 'escolha'] },
    { tema: 'Dependencia disfarcada de amor', brief: 'Precisar para existir. Onde acaba o cuidado e comeca a perda de si.', veus: ['precisar', 'fronteira', 'si', 'medo', 'voz', 'inteira', 'amar'] },
    { tema: 'O vinculo que cura', brief: 'O amor que nao salva mas acompanha. Relacao como espelho e travessia.', veus: ['espelho', 'acompanhar', 'verdade', 'tempo', 'confianca', 'casa', 'juntos'] },
  ],
  forca: [
    { tema: 'Atravessar o escuro', brief: 'A travessia que ninguem ve. Dar nome a dor sem a romantizar.', veus: ['escuro', 'fundo', 'respirar', 'nome', 'passo', 'luz', 'outro lado'] },
    { tema: 'O luto que ninguem viu', brief: 'Perdas que nao tiveram funeral. Lutos silenciosos que pedem espaco.', veus: ['ausencia', 'silencio', 'ritual', 'lugar', 'memoria', 'continuar', 'paz'] },
    { tema: 'A resiliencia que nao e dureza', brief: 'Forca nao e nao sentir. E atravessar sentindo. Suavidade como coragem.', veus: ['dureza', 'sentir', 'flexivel', 'apoio', 'pausa', 'coragem', 'inteira'] },
    { tema: 'O corpo que guarda', brief: 'O que o corpo carrega do que a mente calou. Escutar o sintoma.', veus: ['corpo', 'tensao', 'escuta', 'sinal', 'soltar', 'respirar', 'descanso'] },
  ],
  prosperidade: [
    { tema: 'A heranca financeira emocional', brief: 'A relacao com o dinheiro vem de tras. O extracto como espelho da familia.', veus: ['heranca', 'escassez', 'vergonha', 'merecer', 'extracto', 'corte', 'liberdade'] },
    { tema: 'Pagar para pertencer', brief: 'Comprar lugar, comprar afecto. Onde o dinheiro tapa o medo de nao bastar.', veus: ['pertencer', 'tapar', 'bastar', 'medo', 'valor', 'verdade', 'lugar'] },
    { tema: 'Medo de receber', brief: 'Dar e facil, receber doi. A dificuldade de cobrar e de aceitar o proprio valor.', veus: ['receber', 'cobrar', 'valor', 'culpa', 'abrir', 'merecer', 'fluxo'] },
    { tema: 'Dinheiro como liberdade', brief: 'Para alem da escassez: o dinheiro como meio de escolha e nao de prova.', veus: ['escolha', 'prova', 'suficiencia', 'medo', 'paz', 'rumo', 'liberdade'] },
  ],
  pertenca: [
    { tema: 'Nunca ser escolhida primeiro', brief: 'A ferida da exclusao. O lugar que se procura fora e mora dentro.', veus: ['fora', 'dentro', 'escolha', 'lugar', 'valor', 'casa', 'pertencer'] },
    { tema: 'A familia como sistema', brief: 'O lugar que ocupas no sistema familiar. O que se herda do silencio.', veus: ['sistema', 'lugar', 'silencio', 'segredo', 'ordem', 'paz', 'pertencer'] },
    { tema: 'Amizade e o medo de incomodar', brief: 'Pedir, ocupar espaco, ser demais. A pertenca que nao exige desaparecer.', veus: ['pedir', 'espaco', 'demais', 'medo', 'voz', 'verdade', 'lugar'] },
    { tema: 'As raizes que sustentam', brief: 'De onde vens e o que isso te da. Pertenca como chao, nao como prisao.', veus: ['raiz', 'chao', 'origem', 'liberdade', 'gratidao', 'rumo', 'casa'] },
  ],
  trabalho: [
    { tema: 'Ocupar o teu tamanho', brief: 'Encolher para caber. O profissional que nao habita o seu lugar.', veus: ['encolher', 'tamanho', 'medo', 'voz', 'valor', 'lugar', 'inteira'] },
    { tema: 'A vocacao por baixo da carreira', brief: 'O chamado que ficou em silencio. Distinguir carreira de vocacao.', veus: ['carreira', 'chamado', 'silencio', 'desejo', 'rumo', 'coragem', 'verdade'] },
    { tema: 'O burnout como mensagem', brief: 'O esgotamento que pede mudanca. Escutar o limite antes do colapso.', veus: ['esgotar', 'limite', 'sinal', 'pausa', 'fronteira', 'rumo', 'descanso'] },
    { tema: 'Trabalhar de dentro para fora', brief: 'Construir a partir do que es e nao do que provas. Sentido no fazer.', veus: ['provar', 'sentido', 'dentro', 'valor', 'escolha', 'rumo', 'inteiro'] },
  ],
};

function mesDaSemana(semana: number): string {
  const idx = Math.min(11, Math.floor((semana - 1) / (52 / 12)));
  return MESES[idx];
}

// Constroi as 52 semanas rodando os universos e percorrendo os bancos de temas.
export const CALENDARIO_ANUAL: WeekSeed[] = Array.from({ length: 52 }, (_, i) => {
  const semana = i + 1;
  const universo = ROTACAO[i % ROTACAO.length];
  const banco = TEMAS[universo];
  const tema = banco[Math.floor(i / ROTACAO.length) % banco.length];
  return {
    semana,
    mes: mesDaSemana(semana),
    universo,
    tema: tema.tema,
    brief: tema.brief,
    veus: tema.veus,
  };
});

export function semanaSeed(n: number): WeekSeed | undefined {
  return CALENDARIO_ANUAL.find((w) => w.semana === n);
}
