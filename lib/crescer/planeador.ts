// PLANEADOR DA MÃE — cadência de 3 posts/dia (a Vivianne: "são 3 posts diários; às 23h
// tem boa audiência por causa do Brasil"). Slots editáveis; o 23h é o de prime-time BR.
export interface Slot { id: string; hora: string; nome: string }
export const SLOTS: Slot[] = [
  { id: 'manha', hora: '11:00', nome: 'manhã' },
  { id: 'tarde', hora: '17:00', nome: 'tarde' },
  { id: 'noite', hora: '23:00', nome: 'noite · Brasil' },
];

// DATAS a partir de componentes LOCAIS (nunca toISOString — recua um dia em PT/UTC+1).
export function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}
export function segundaDaSemana(base: Date, offsetSemanas = 0): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dow + offsetSemanas * 7);
  return d;
}
export function diasDaSemana(segunda: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + i));
}
export const DIAS_PT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
export const rotuloDia = (d: Date) => `${DIAS_PT[(d.getDay() + 6) % 7]} ${d.getDate()}`;
