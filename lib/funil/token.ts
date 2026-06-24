import crypto from 'crypto';

// Token simples (HMAC) para o link de "deixar de receber" das cartas do funil.
// Não precisa de guardar nada por leitora: deriva-se do email + um segredo.
const SEGREDO = process.env.FUNIL_UNSUB_SECRET || process.env.RESEND_API_KEY || 'veu';

export function tokenSair(email: string): string {
  return crypto.createHmac('sha256', SEGREDO).update(email.toLowerCase()).digest('hex').slice(0, 24);
}

export function tokenValido(email: string, token: string): boolean {
  const esperado = tokenSair(email);
  // comparação em tempo constante
  try {
    return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(token || ''));
  } catch {
    return false;
  }
}

export function urlSair(email: string): string {
  const e = encodeURIComponent(email);
  return `https://viviannedossantos.com/api/funil-sair?e=${e}&t=${tokenSair(email)}`;
}
