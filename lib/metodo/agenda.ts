// Método VS · agenda das portas (cadência de reels)
//
// As portas vivem de REELS (carrosséis ficam na mãe e na veu.a.veu).
// Cadência sustentável: 3 reels por semana por conta (segunda, quarta, sexta).
//
// HORA: as frases publicam-se DE MANHÃ, às 11h (a Vivianne pediu; o conteúdo da
// manhã é a frase). A hora é editável em massa em /admin/metodo (botão "hora").
//
// REGRA DE TIMEZONE (aprendida à força): datas formatadas a partir de
// componentes LOCAIS, nunca toISOString (em UTC+1 recua um dia).

import { ContaId } from './contas';
import { Reel } from './reels';
import { aberturaDaConta } from './abertura';

export const DIAS_POST = [1, 3, 5]; // segunda, quarta, sexta (getDay: 0=dom)
export const HORA_POST = '11:00';
// A MÃE (@vivianne.dos.santos) partilha a conta com as séries diárias e a loja,
// que já ocupam a manhã e a noite (vcsabia 07h · 7 Véus 13h · hojeemmim 21h).
// Por isso o método da mãe vai para a TARDE (17h), o vão livre do dia, para não
// amontoar conteúdo. As portas (ver/vir/viver) têm conta própria → ficam às 11h.
export const HORA_POST_MAE = '17:00';
export const horaDoMetodo = (conta: string): string => (conta === 'mae' ? HORA_POST_MAE : HORA_POST);

/** 'YYYY-MM-DD' a partir de componentes locais (nunca toISOString). */
export function dataLocal(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** A segunda-feira da semana ATUAL (a que contém hoje; domingo conta como fim
 *  da semana seg→dom). offset 0 da produção = esta semana, como na veu.a.veu. */
export function segundaDestaSemana(de: Date = new Date()): Date {
  const d = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const dow = d.getDay(); // 0=dom, 1=seg, ...
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

/** A próxima segunda-feira (ou hoje, se já for segunda), a meia-noite local. */
export function proximaSegunda(de: Date = new Date()): Date {
  const d = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const wd = d.getDay(); // 0=dom, 1=seg, ...
  const ate = wd === 1 ? 0 : (8 - wd) % 7 || 7;
  d.setDate(d.getDate() + ate);
  return d;
}

export interface AgendaItem {
  reel: Reel;
  /** 'YYYY-MM-DD' local. */
  data: string;
  hora: string;
  ordem: number;
}

/** Distribui a sequência de abertura de uma conta pelos dias de post. */
export function agendarAbertura(conta: ContaId, inicio: Date = new Date()): AgendaItem[] {
  const reels = aberturaDaConta(conta);
  const itens: AgendaItem[] = [];
  const cursor = proximaSegunda(inicio);
  let ordem = 0;
  // avança dia a dia; nos dias de post, coloca o próximo reel.
  let guarda = 0;
  while (ordem < reels.length && guarda < 120) {
    if (DIAS_POST.includes(cursor.getDay())) {
      itens.push({ reel: reels[ordem], data: dataLocal(cursor), hora: HORA_POST, ordem });
      ordem += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
    guarda += 1;
  }
  return itens;
}

/** Agenda das 3 contas, escalonada (cada conta começa numa semana, para não
 *  abrir tudo no mesmo dia e dar fôlego à produção). */
export function agendarTodas(inicio: Date = new Date()): Record<'ver' | 'vir' | 'viver', AgendaItem[]> {
  const base = proximaSegunda(inicio);
  const semana = (n: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n * 7);
    return d;
  };
  return {
    ver: agendarAbertura('ver', semana(0)),
    vir: agendarAbertura('vir', semana(1)),
    viver: agendarAbertura('viver', semana(2)),
  };
}
