// Padroes sugeridos por universo — 5 cada, para escolher (nao imaginar) e para
// gerar a biblioteca de uma vez.
import type { ColecaoId } from '@/lib/colecoes';

export const PADROES_SUGERIDOS: Record<ColecaoId, string[]> = {
  'freeme-mae': ['Apagar-se para amar', 'Compensar a culpa', 'Ser tudo para todos', 'A mãe perfeita', 'Dizer sim quando o corpo diz não'],
  infonte: ['Provar que vales', 'A voz que nunca chega', 'Perseguir metas que não são tuas', 'Identidade colada ao fazer', 'Medir-te pela régua dos outros'],
  amor: ['Amar demais', 'Dar e receber em desequilíbrio', 'Escolher quem te magoa', 'Apagar-te na relação', 'Confundir amor com intensidade'],
  forca: ['Aguentar sozinha', 'Não pedir ajuda', 'A armadura permanente', 'Engolir o luto', 'Não chorar à frente de ninguém'],
  prosperidade: ['Medo de receber', 'Pagar para pertencer', 'Dar para receber migalhas', 'Trabalhar para merecer', 'Não cobrar o teu valor'],
  pertenca: ['Nunca incomodar', 'Encolher para caber', 'Ser escolhida por último', 'Comprar o teu lugar', 'Calar para não perder o lugar'],
  trabalho: ['Provar valor pelo cansaço', 'Não saber parar', 'Encolher o teu tamanho', 'Vocação adiada', 'Identidade colada ao cargo'],
};
