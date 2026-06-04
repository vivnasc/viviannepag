"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ANNUAL_WEEKS, type WeekSeed } from "@/lib/carousel-calendar";
import { isoWeekToMonday } from "@/lib/weekly-social/schedule";

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function isoRangeLabel(year: number, week: number): string {
  const mon = isoWeekToMonday(year, week);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);
  const monD = mon.getUTCDate();
  const sunD = sun.getUTCDate();
  const monM = MONTHS_PT[mon.getUTCMonth()];
  const sunM = MONTHS_PT[sun.getUTCMonth()];
  if (monM === sunM) return `${monD}–${sunD} ${monM}`;
  return `${monD} ${monM}–${sunD} ${sunM}`;
}

const TARGET_YEAR = new Date().getUTCFullYear();

type Existing = { id: string; title: string; slug: string; createdAt?: string };

export default function CalendarioPage() {
  const [existing, setExisting] = useState<Existing[]>([]);
  const [creating, setCreating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/colecoes/list", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setExisting(data.items || []);
      }
    })();
  }, []);

  async function createFromSeed(seed: WeekSeed, opts: { skipClaude?: boolean }) {
    setCreating(seed.week);
    try {
      const r = await fetch("/api/admin/colecoes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${seed.title} (Sem ${seed.week})`,
          brief: seed.brief,
          numDias: 7,
          skipClaude: !!opts.skipClaude,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      window.location.href = `/admin/producao/colecoes/${data.id}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falhou: ${msg}`);
      setCreating(null);
    }
  }

  // Mapa título → existing (heurística simples para sinalizar já-criadas)
  const existingByTitle = new Map<string, Existing>();
  for (const e of existing) {
    const m = e.title.match(/Sem (\d+)/);
    if (m) existingByTitle.set(`week-${Number(m[1])}`, e);
  }

  // Agrupar por mês
  const byMonth = new Map<string, WeekSeed[]>();
  for (const w of ANNUAL_WEEKS) {
    if (filter && !w.title.toLowerCase().includes(filter.toLowerCase()) &&
        !w.tag.toLowerCase().includes(filter.toLowerCase()) &&
        !w.monthLabel.toLowerCase().includes(filter.toLowerCase())) continue;
    if (!byMonth.has(w.monthLabel)) byMonth.set(w.monthLabel, []);
    byMonth.get(w.monthLabel)!.push(w);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href="/admin/producao/colecoes" className="hover:text-escola-dourado">
          ← colecções
        </Link>
        <span>/ calendário anual</span>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
          Calendário anual — 52 semanas
        </h2>
        <p className="text-sm text-escola-creme-50">
          Sugestões para todo o ano, ancoradas nas estações de Maputo (chuvas, fresco,
          equinócios, solstícios) + ciclos lunares + datas-marco. Clica <span className="text-escola-dourado">✦</span> para
          gerar uma colecção a partir do brief sugerido (com Claude); clica <span className="text-escola-dourado">📝</span> para
          começar em branco e escreveres tudo. Podes editar título e brief depois.
        </p>
        <input
          type="text"
          placeholder="filtrar por mês, tema, tag (ex: 'lua', 'chuva', 'mulher')"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50"
        />
      </div>

      {/* As minhas colecções já existentes */}
      {(existing.length > 0 || true) && (
        <section className="mb-8">
          <h3 className="mb-3 border-b border-escola-border pb-2 font-serif text-lg text-escola-dourado">
            As minhas colecções ({existing.length + 1})
          </h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="rounded-xl border border-escola-dourado/30 bg-escola-card p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <Link
                  href="/admin/producao/carrossel-veus"
                  className="text-sm font-semibold text-escola-creme hover:text-escola-dourado"
                >
                  A Estação dos Véus
                </Link>
                <span className="rounded bg-escola-dourado/20 px-2 py-0.5 text-[10px] text-escola-dourado">
                  fixa
                </span>
              </div>
              <p className="text-xs italic text-escola-creme-50">
                7 véus do livro · sempre disponível
              </p>
            </li>
            {[...existing]
              .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
              .map((it, idx) => (
              <li
                key={it.id}
                className={`rounded-xl border bg-escola-card p-4 hover:border-escola-dourado/40 ${
                  idx === 0 ? "border-escola-dourado/50" : "border-escola-border"
                }`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <Link
                    href={`/admin/producao/colecoes/${it.id}`}
                    className="block text-sm font-semibold text-escola-creme hover:text-escola-dourado"
                  >
                    {it.title}
                  </Link>
                  {idx === 0 && (
                    <span className="shrink-0 rounded bg-escola-dourado/20 px-2 py-0.5 text-[10px] text-escola-dourado">
                      mais recente
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-escola-creme-50">
                  {it.createdAt
                    ? new Date(it.createdAt).toLocaleDateString("pt", { day: "numeric", month: "short", year: "numeric" })
                    : ""}
                  {" · "}
                  <Link href={`/admin/producao/colecoes/${it.id}`} className="text-escola-dourado hover:underline">
                    abrir editor →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h3 className="mb-3 border-b border-escola-border pb-2 font-serif text-lg text-escola-dourado">
        Sugestões por semana (52)
      </h3>

      <div className="space-y-8">
        {Array.from(byMonth.entries()).map(([month, weeks]) => (
          <section key={month}>
            <h3 className="mb-3 border-b border-escola-border pb-2 font-serif text-lg text-escola-dourado">
              {month}
            </h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {weeks.map((w) => {
                const ex = existingByTitle.get(`week-${w.week}`);
                const isCreating = creating === w.week;
                return (
                  <li
                    key={w.week}
                    className="rounded-xl border border-escola-border bg-escola-card p-4"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-escola-creme-50">
                          Semana ISO {w.week} · <span className="text-escola-creme">{isoRangeLabel(TARGET_YEAR, w.week)}</span> · <span className="text-escola-dourado">{w.tag}</span>
                        </p>
                        <p className="font-serif text-base text-escola-creme">{w.title}</p>
                      </div>
                      {ex && (
                        <Link
                          href={`/admin/producao/colecoes/${ex.id}`}
                          className="shrink-0 rounded bg-green-700/20 px-2 py-1 text-[10px] text-green-300"
                        >
                          ✓ criada — abrir
                        </Link>
                      )}
                    </div>
                    <p className="mb-3 line-clamp-3 text-xs italic text-escola-creme-50">
                      {w.brief}
                    </p>
                    {!ex && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => createFromSeed(w, {})}
                          disabled={isCreating}
                          className="rounded bg-escola-dourado/90 px-3 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
                        >
                          {isCreating ? "a gerar… 60-90s" : "✦ Gerar com Claude"}
                        </button>
                        <button
                          onClick={() => createFromSeed(w, { skipClaude: true })}
                          disabled={isCreating}
                          className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
                        >
                          📝 Vazia
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
