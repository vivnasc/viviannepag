import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

type Sub = { email: string; source: string | null; created_at: string | null };

export default async function ListaAdmin() {
  if (!(await isAdmin())) {
    return (
      <main className="max-w-[720px] mx-auto px-7 py-12">
        <p className="text-creme-2/70 font-serif italic">Sem acesso. Entra primeiro no admin.</p>
      </main>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('subscribers')
    .select('email, source, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);
  const subs = (data ?? []) as Sub[];

  const porOrigem = new Map<string, number>();
  for (const s of subs) {
    const k = s.source || 'site';
    porOrigem.set(k, (porOrigem.get(k) ?? 0) + 1);
  }

  return (
    <main className="max-w-[860px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">a lista</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-3 font-serif italic">
          {subs.length} emails captados · por origem:{' '}
          {[...porOrigem.entries()].map(([k, n]) => `${k} (${n})`).join(' · ')}
        </p>
        <a
          href="/api/admin/lista-csv"
          className="inline-block mt-4 rounded-full border border-salvia/50 text-salvia px-5 py-2 text-[0.82rem] hover:bg-salvia/10 transition-colors no-underline"
        >
          exportar CSV
        </a>
      </header>

      <div className="border border-ocre/15 rounded-[14px] overflow-hidden">
        <table className="w-full text-[0.85rem]">
          <thead>
            <tr className="text-left text-[0.68rem] tracking-[0.22em] uppercase text-salvia border-b border-ocre/15">
              <th className="px-5 py-3 font-normal">email</th>
              <th className="px-5 py-3 font-normal">origem</th>
              <th className="px-5 py-3 font-normal">quando</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s, i) => (
              <tr key={i} className="border-b border-ocre/10 last:border-0">
                <td className="px-5 py-2.5 text-creme">{s.email}</td>
                <td className="px-5 py-2.5">
                  <span className={s.source === 'romance-amparo' ? 'text-ambar' : 'text-creme-2/60'}>
                    {s.source || 'site'}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-creme-2/50">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : '·'}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-6 text-creme-2/50 italic font-serif">Ainda ninguém. O funil está fresco.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
