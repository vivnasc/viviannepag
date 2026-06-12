// VOZ das séries diárias — fonte ÚNICA partilhada por gerar-frase (1 frase) e
// gerar-mes (bulk). Editar AQUI muda os dois.

export type Serie = 'vcsabia' | 'hojeemmim';

export const VOZ: Record<Serie, string> = {
  vcsabia:
    'Série "VC Sabia", de MANHÃ: tom esperançoso e luminoso. O cartão já mostra o rótulo "Sabias que…" por cima — por isso a frase NUNCA começa por "Sabias que": escreve só o que vem a seguir ao rótulo. Padrão preferido: uma verdade serena da natureza ou do dia a dia + uma ponte para a pessoa ("Tu também…"). Ex.: "Uma planta não cresce mais depressa por receber mais água do que precisa. Tu também floresces melhor quando respeitas os teus limites." A analogia da natureza requadra uma LUTA real (pressa, exigência, culpa) em força serena, e vira um PRESENTE que apetece enviar a quem precisa de o ouvir hoje. Doce, com lastro, nunca foleiro.',
  hojeemmim:
    'Série "Hoje em Mim" (estilo "Hoje aprendi que…"), de NOITE: contemplativo, na PRIMEIRA pessoa, íntimo. Uma aprendizagem sobre si própria (silêncio, limites, pertença, herança). Ex.: "Hoje aprendi que o meu silêncio é, muitas vezes, a resposta mais honesta." Uma verdade na 1.ª pessoa tão PRECISA que a pessoa a sente como SUA e a põe na sua story como quem diz "sou eu". O dia da semana colore o tom (ex.: domingo mais repouso, segunda mais recomeço, sexta mais balanço), com subtileza.',
};

export const PORTA_SALA =
  'PORTA->SALA: quando a frase funda for fechada para um estranho, abre por um reconhecimento concreto e fecha na frase funda. Concreto e sensorial, NUNCA genérico/autoajuda. Uma só ideia, ritmo poético. Português europeu com TODOS os acentos. SEM travessões (usa vírgulas/pontos).';

export const REFLEXO_PARTILHA = `REFLEXO DE PARTILHA (o objetivo destes posts é SEREM PARTILHADOS): escreve para a pessoa ler e, sem pensar, sentir "isto sou eu" OU "tenho de mandar isto a alguém". Para isso:
- nomeia um sentimento PRECISO e universal que quase ninguém consegue pôr em palavras (dás voz ao indizível);
- dá RECONHECIMENTO ou PERMISSÃO que apetece passar a outra pessoa (descansar, dizer não, ir devagar, parar de carregar o que não é teu);
- tão verdadeira que apeteça GUARDAR e ENVIAR a alguém concreto (a mãe, a irmã, a amiga cansada);
- a partilha nasce do RECONHECIMENTO e da BELEZA, NUNCA do choque, alarme ou clickbait. Nada de "3 sinais", "o erro que…", nem promessas. Dignidade sempre.`;

// BREVIDADE (decisão da Vivianne, com exemplos aprovados): a frase da IMAGEM é
// curta, de leitura rápida — a imagem contemplativa respira. A versão longa,
// que ela ama, vive na LEGENDA. Manter a imagem + a viragem; cortar a explicação.
export const BREVIDADE: Record<Serie, string> = {
  vcsabia:
    'BREVIDADE (regra dura): a "frase" tem NO MÁXIMO ~18 palavras — a imagem da natureza (1 frase curta) + a ponte "Tu também…" (1 frase curta). Corta a explicação: a frase confia em quem lê. Ex. aprovado: "…o pão só cresce depois de repousar? Tu também." / "…a porta de madeira incha no verão e custa a abrir? Não estás partida. É a estação."',
  hojeemmim:
    'BREVIDADE (regra dura): a "frase" tem NO MÁXIMO ~13 palavras, UMA só respiração. Corta a explicação. Ex. aprovado: "Solto hoje a versão de mim que tinha de ser forte sempre."',
};

export const LEGENDA_LONGA =
  'LEGENDA: além da frase curta, devolve uma "legenda" mais LONGA (2 a 4 frases curtas): a versão que respira, a mesma ideia desenvolvida com toda a beleza, em parágrafos separados por \\n\\n; fecha com um convite digno a guardar/enviar a alguém (sem vender, sem nomear o formato).';

export function estacaoPt(d: Date): string {
  const m = d.getMonth() + 1; // Portugal (hemisfério norte)
  if (m === 12 || m <= 2) return 'inverno';
  if (m <= 5) return 'primavera';
  if (m <= 8) return 'verão';
  return 'outono';
}
