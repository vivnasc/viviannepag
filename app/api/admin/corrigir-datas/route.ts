import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const CORRECOES: Record<string, string> = {
  'o-amor-que-cabe-quando-tu-cabes': '2025-07-04',
  'a-mulher-que-escolheu-ficar-rica': '2025-08-08',
  'quando-os-teus-filhos-ja-nao-carregam': '2025-09-12',
  'a-liberdade-de-nao-ter-de-perceber-tudo': '2025-10-16',
  'o-prazer-de-fazer-uma-coisa-de-cada-vez': '2025-11-21',
  'o-dia-em-que-paraste-de-te-preparar-para-viver': '2025-12-28',
  'a-gentileza-que-tens-contigo-quando-ninguem-ve': '2026-02-01',
  'acordar-sem-pressa': '2026-02-28',
  'a-beleza-de-seres-vista-a-meio': '2026-03-30',
  'dizer-nao-e-o-primeiro-sim-que-te-das': '2026-04-22',
  'a-mulher-que-ja-nao-pede-desculpa-por-existir': '2026-05-08',
  'o-dia-em-que-deixaste-de-te-explicar': '2026-05-18',
};

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const corrigidos: string[] = [];
  const erros: string[] = [];

  for (const [slug, novaData] of Object.entries(CORRECOES)) {
    const { error } = await supabase
      .from('escritos')
      .update({ data: novaData, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    if (error) erros.push(`${slug}: ${error.message}`);
    else corrigidos.push(slug);
  }

  return NextResponse.json({ ok: true, corrigidos: corrigidos.length, erros });
}
