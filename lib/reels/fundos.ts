// Pool de fundos VARIADOS para a "Frase com motion" / cinéticos (modo manual ou
// quando a IA não dá um próprio). Nunca repetir o mesmo (chega de "raízes
// douradas"). Cada um é um prompt MidJourney pronto, fine art, sem pessoas/texto.
export const FUNDOS_VARIADOS = [
  'soft morning light through sheer curtains, dust motes floating, calm interior, fine art, no people, no text, --ar 9:16 --style raw',
  'still water surface with gentle ripples reflecting a pale sky, serene, fine art, no people, no text, --ar 9:16 --style raw',
  'a single smooth stone with soft shadow on sand, minimal, warm neutral tones, fine art, no people, no text, --ar 9:16 --style raw',
  'soft mist over quiet hills at dawn, muted tones, ethereal, fine art, no people, no text, --ar 9:16 --style raw',
  'flowing translucent fabric in soft light, gentle folds, muted palette, fine art, no people, no text, --ar 9:16 --style raw',
  'a calm horizon over the sea at blue hour, vast and serene, fine art, no people, no text, --ar 9:16 --style raw',
  'fine sand with delicate wind ripples, soft warm light, minimal, fine art, no people, no text, --ar 9:16 --style raw',
  'a few translucent leaves backlit by soft sun, delicate veins, muted green, fine art, no people, no text, --ar 9:16 --style raw',
  'a gentle candle flame in the dark, soft warm glow, intimate, fine art, no people, no text, --ar 9:16 --style raw',
  'pale petals resting on still water, soft dreamy tones, calm, fine art, no people, no text, --ar 9:16 --style raw',
  'wisps of soft smoke curling in a beam of light, deep indigo, ethereal, fine art, no people, no text, --ar 9:16 --style raw',
  'a clearing in a misty forest with soft light, calm and sacred, fine art, no people, no text, --ar 9:16 --style raw',
];
// um diferente do atual (para "novo prompt" dar mesmo outro)
export function fundoAleatorio(excluir?: string): string {
  const pool = excluir ? FUNDOS_VARIADOS.filter((f) => f !== excluir) : FUNDOS_VARIADOS;
  const lista = pool.length ? pool : FUNDOS_VARIADOS;
  return lista[Math.floor(Math.random() * lista.length)];
}
