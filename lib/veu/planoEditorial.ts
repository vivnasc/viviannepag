// PLANO EDITORIAL da conta didática "Véu a Véu" — 13 semanas (~3 meses).
// Não é sazonal (isso é a linha de produto dos 7 Véus). Aqui as 4 matérias
// entrelaçam-se numa SÓ JORNADA holística: pertencer -> a máscara e a sombra ->
// as heranças do sistema -> sentido e travessia. Nenhum tema se repete.
// A semana atual avança sozinha; a Vivianne não escolhe nada.

export type SemanaEditorial = {
  semana: number;        // 1..13
  parte: string;         // movimento da jornada
  curso: string;         // id da matéria (cursos.ts)
  tema: string;          // conceito da matéria (sem repetir)
  mote: string;          // a frase-âncora da semana (o coração do tema)
  heroi: string;         // o gancho "I am a Hero" da semana (curar liberta as gerações)
  arenas: string[];      // arena(s) de vida onde o conceito ATERRA (arenas.ts). A 1.ª é a
                         //   dominante; várias = semana multi-arena. Família é a casa-base.
                         //   O conceito lidera SEMPRE; a arena só o ilumina, nunca o reordena.
};

export const PARTES: { id: string; nome: string; descricao: string }[] = [
  { id: 'I', nome: 'I · Pertencer e a raiz', descricao: 'Antes de tudo, a alma quer pertencer. Onde começa o teu lugar.' },
  { id: 'II', nome: 'II · A máscara e a sombra', descricao: 'Quem és por baixo do que mostras, e o que recusas em ti.' },
  { id: 'III', nome: 'III · As heranças', descricao: 'O que carregas que nunca foi teu, e como devolvê-lo.' },
  { id: 'IV', nome: 'IV · Sentido e travessia', descricao: 'Dar sentido à dor e tornar-te quem sempre foste.' },
];

export const PLANO_EDITORIAL: SemanaEditorial[] = [
  { semana: 1, parte: 'I', curso: 'constelacao', tema: 'O direito de pertencer', mote: 'Pertencer é a primeira fome da alma.', heroi: 'pertencer sem repetir: ficar sendo quem és', arenas: ['pessoal'] },
  { semana: 2, parte: 'I', curso: 'constelacao', tema: 'Dar e receber em equilíbrio', mote: 'O amor vive do que circula entre dois.', heroi: 'quebras o ciclo quando aprendes a receber, não só a dar', arenas: ['pessoal', 'casal'] },
  { semana: 3, parte: 'I', curso: 'desenvolvimento', tema: 'Limites saudáveis', mote: 'Um limite é onde começa o respeito.', heroi: 'pôr um limite é parar a dor antes de ela passar à frente', arenas: ['pessoal', 'casal'] },
  { semana: 4, parte: 'II', curso: 'transpessoal', tema: 'Persona e máscara social', mote: 'Quem és por baixo do que mostras?', heroi: 'tirar a máscara liberta quem vem depois de a usar', arenas: ['organizacional'] },
  { semana: 5, parte: 'II', curso: 'transpessoal', tema: 'Sombra e integração', mote: 'O que recusas em ti, governa-te.', heroi: 'o que integras em ti, deixas de passar aos teus filhos', arenas: ['pessoal'] },
  { semana: 6, parte: 'III', curso: 'constelacao', tema: 'Lealdades invisíveis', mote: 'Há amores que te fazem repetir destinos.', heroi: 'não tens de repetir o destino de ninguém para o amar', arenas: ['pessoal', 'organizacional'] },
  { semana: 7, parte: 'III', curso: 'constelacao', tema: 'Parentificação: ser mãe da mãe', mote: 'A criança que cresceu cedo demais.', heroi: 'não nasceste para ser mãe da tua mãe, podes pousar isso', arenas: ['pessoal', 'maternidade'] },
  { semana: 8, parte: 'III', curso: 'desenvolvimento', tema: 'Burnout do cuidador', mote: 'O teu cansaço é um pedido de limite.', heroi: 'descansar também é cortar uma herança de exaustão', arenas: ['saude', 'organizacional'] },
  { semana: 9, parte: 'IV', curso: 'espiritualidade', tema: 'Sentido e propósito (Frankl)', mote: 'Um porquê sustenta quase todo o como.', heroi: 'a tua dor, transformada, vira o sentido de quem vem a seguir', arenas: ['organizacional', 'pessoal'] },
  { semana: 10, parte: 'IV', curso: 'espiritualidade', tema: 'A noite escura da alma', mote: 'No escuro também se cresce.', heroi: 'atravessas o escuro para que eles não tenham de o herdar', arenas: ['pessoal', 'saude'] },
  { semana: 11, parte: 'IV', curso: 'constelacao', tema: 'O que pertence a cada um voltar a cada um', mote: 'Curar é devolver o que não é teu.', heroi: 'devolves o que não é teu, e a linhagem inteira respira', arenas: ['pessoal'] },
  { semana: 12, parte: 'IV', curso: 'espiritualidade', tema: 'Perdão: libertar-se, não esquecer', mote: 'Perdoar é soltar o peso, não negar a dor.', heroi: 'perdoar corta a corrente, sem fingir que não doeu', arenas: ['pessoal', 'casal'] },
  { semana: 13, parte: 'IV', curso: 'transpessoal', tema: 'Individuação', mote: 'Tornar-te quem sempre foste.', heroi: 'tornares-te quem és é o maior presente para quem vem depois', arenas: ['pessoal'] },
];

// ARRANQUE do plano: a 2ª-feira em que a jornada começa = semana 1.
// (8 de junho de 2026, segunda-feira.) A partir daqui conta-se sozinho.
const INICIO = Date.UTC(2026, 5, 8);

// A semana atual do PLANO (1..13), contada a partir do arranque e dando a
// volta ao fim de 13. Antes do arranque, fica na semana 1.
// IMPORTANTE (fuso): usa os componentes LOCAIS da data (getFullYear/Month/Date),
// nunca os UTC — senão em PT (UTC+1) a meia-noite de 2.ª recua um dia e o cálculo
// salta uma semana inteira (ex.: mostrava "individuação" em vez de "pertencer").
export function semanaEditorialAtual(hoje = new Date()): SemanaEditorial {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const semanasPassadas = Math.floor((hojeUTC - INICIO) / (7 * 864e5));
  const idx = ((semanasPassadas % PLANO_EDITORIAL.length) + PLANO_EDITORIAL.length) % PLANO_EDITORIAL.length;
  return PLANO_EDITORIAL[Math.max(0, idx)];
}

export function getSemanaEditorial(n: number): SemanaEditorial {
  return PLANO_EDITORIAL.find((s) => s.semana === n) ?? PLANO_EDITORIAL[0];
}
