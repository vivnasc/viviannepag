// Pool de fundos VARIADOS para a "Frase com motion" / cinéticos (modo manual ou
// quando a IA não dá um próprio). Nunca repetir o mesmo (chega de "raízes
// douradas"). Cada um é um prompt MidJourney pronto, fine art, sem pessoas/texto.
// Dentro do conceito da marca: ETÉREO, SAGRADO, ABSTRATO, paleta profunda
// (indigo/vinho) com luz suave. Varia o motivo, mas nunca "raízes douradas"
// nem fotos genéricas (tecido/floresta).
export const FUNDOS_VARIADOS = [
  'a single soft shaft of light descending through deep indigo darkness, dust of light, ethereal and sacred, fine art, no people, no text, --ar 9:16 --style raw',
  'gentle ripples of light over still dark water at dusk, deep indigo and faint warm glow, ethereal, fine art, no people, no text, --ar 9:16 --style raw',
  'soft luminous mist drifting in deep blue darkness, a quiet inner glow, sacred and contemplative, fine art, no people, no text, --ar 9:16 --style raw',
  'tiny floating particles of light suspended in deep indigo, like breath made visible, ethereal, fine art, no people, no text, --ar 9:16 --style raw',
  'a faint aurora of soft rose and blue light over a dark serene sky, ethereal and vast, fine art, no people, no text, --ar 9:16 --style raw',
  'a warm gentle glow emerging from deep wine-dark shadow, intimate and sacred, fine art, no people, no text, --ar 9:16 --style raw',
  'soft veils of light layered in deep indigo space, translucent and luminous, ethereal, fine art, no people, no text, --ar 9:16 --style raw',
  'a calm horizon line where deep blue meets a soft band of warm light, serene and transcendent, fine art, no people, no text, --ar 9:16 --style raw',
  'delicate embers of light rising slowly in the dark, deep indigo and amber glow, sacred, fine art, no people, no text, --ar 9:16 --style raw',
  'a soft halo of light blooming in deep darkness, gentle and numinous, fine art, no people, no text, --ar 9:16 --style raw',
];
// um diferente do atual (para "novo prompt" dar mesmo outro)
export function fundoAleatorio(excluir?: string): string {
  const pool = excluir ? FUNDOS_VARIADOS.filter((f) => f !== excluir) : FUNDOS_VARIADOS;
  const lista = pool.length ? pool : FUNDOS_VARIADOS;
  return lista[Math.floor(Math.random() * lista.length)];
}
