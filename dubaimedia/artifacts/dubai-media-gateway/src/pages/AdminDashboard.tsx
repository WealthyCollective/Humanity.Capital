import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Users, Film, Star, FileText, Building2, Banknote, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
const getBase = () => (import.meta.env.DEV ? '' : BASE);

function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const r = await fetch(`${getBase()}/api/admin/stats`);
      if (!r.ok) throw new Error('Failed to load admin stats');
      return r.json();
    },
    refetchInterval: 30000,
  });
}

const fmtAed = (v: number) =>
  v >= 1_000_000
    ? `AED ${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `AED ${(v / 1_000).toFixed(0)}K`
    : `AED ${v}`;

const fmtNum = (v: number) =>
  v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : `${v}`;

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  disbursed:      { label: 'Disbursed',      bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: <CheckCircle className="h-3 w-3" /> },
  bank_transfer:  { label: 'Bank Transfer',  bg: 'bg-blue-50',     text: 'text-blue-700',    icon: <ArrowRight className="h-3 w-3" /> },
  processing:     { label: 'Processing',     bg: 'bg-amber-50',    text: 'text-amber-700',   icon: <Clock className="h-3 w-3" /> },
  pending:        { label: 'Pending Review', bg: 'bg-slate-50',    text: 'text-slate-600',   icon: <AlertCircle className="h-3 w-3" /> },
};

interface KpiCard { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }

function KpiCard({ icon, label, value, sub, accent }: KpiCard) {
  return (
    <div
      className="flex flex-col gap-3 p-6 border"
      style={{
        backgroundColor: accent ? '#2E6F9E' : 'rgba(255,255,255,0.04)',
        borderColor: accent ? '#2E6F9E' : 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-light text-white tracking-tight">{value}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
      </div>
      <p className="text-[10px] font-medium tracking-[0.16em] uppercase" style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
    </div>
  );
}

function BarRow({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <p className="text-xs font-light w-40 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#2E6F9E' }} />
      </div>
      <p className="text-xs w-10 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse 120% 80% at 70% 10%, #C8E4F2 0%, #4A8FBB 35%, #2E6F9E 65%, #1C5480 100%)', minHeight: '80vh' }}>
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse 120% 80% at 70% 10%, #C8E4F2 0%, #4A8FBB 35%, #2E6F9E 65%, #1C5480 100%)', minHeight: '80vh' }}>
        <p className="text-white/40 text-sm">Could not load admin data.</p>
      </div>
    );
  }

  const { kpis, disbursements, disbursementSummary, monthly, traffic, demographics, recentApplications } = data;

  const maxViews = Math.max(...monthly.map((m: any) => m.applications));

  return (
    <div className="w-full min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 80% at 70% 10%, #C8E4F2 0%, #4A8FBB 35%, #2E6F9E 65%, #1C5480 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-6 md:px-10 py-8">
          <p className="text-[9px] font-medium tracking-[0.24em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Dubai Media Gateway — Internal Operations
          </p>
          <h1 className="text-2xl md:text-3xl font-light text-white">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-10 space-y-12">

        {/* ── KPI grid ───────────────────────────────────────────────────── */}
        <section>
          <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Platform Overview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={<FileText className="h-4 w-4" />} label="Total Applications" value={fmtNum(kpis.totalApplications)} sub="eligibility submissions" accent />
            <KpiCard icon={<Banknote className="h-4 w-4" />} label="Potential Incentives" value={fmtAed(kpis.totalPotentialRebateAed)} sub="estimated rebate pipeline" />
            <KpiCard icon={<Film className="h-4 w-4" />} label="Films Registered" value={fmtNum(kpis.filmsRegistered)} sub="active + submitted" />
            <KpiCard icon={<Users className="h-4 w-4" />} label="Platform Users" value={fmtNum(kpis.totalUsers)} sub="registered accounts" />
            <KpiCard icon={<Users className="h-4 w-4" />} label="Talent Registered" value={fmtNum(kpis.talentRegistered)} sub="verified + pending" />
            <KpiCard icon={<Star className="h-4 w-4" />} label="Mentors" value={`${kpis.mentorsRegistered}`} sub="resident mentors" />
            <KpiCard icon={<Building2 className="h-4 w-4" />} label="Hub Applications" value={`${kpis.hubApplications}`} sub="space requests" />
            <KpiCard icon={<FileText className="h-4 w-4" />} label="Festival Submissions" value={fmtNum(kpis.festivalSubmissions)} sub="DIFF 2026 entries" />
          </div>
        </section>

        {/* ── Monthly trend + Traffic ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Monthly applications bar chart */}
          <section className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Trend</p>
            <h2 className="text-base font-light text-white mb-6">Monthly Applications</h2>
            <div className="flex items-end gap-2 h-36">
              {monthly.map((m: any, i: number) => {
                const h = Math.round((m.applications / maxViews) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.applications}</p>
                    <div className="w-full rounded-sm" style={{ height: `${h}%`, backgroundColor: '#2E6F9E', minHeight: '4px', opacity: 0.7 + i * 0.05 }} />
                    <p className="text-[8px] text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.month.split(' ')[0]}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Traffic */}
          <section className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Analytics</p>
            <h2 className="text-base font-light text-white mb-1">Traffic Overview</h2>
            <div className="flex gap-6 mb-5">
              <div>
                <p className="text-xl font-light text-white">{fmtNum(traffic.totalPageViews)}</p>
                <p className="text-[9px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>Page views</p>
              </div>
              <div>
                <p className="text-xl font-light text-white">{fmtNum(traffic.uniqueVisitors)}</p>
                <p className="text-[9px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>Unique visitors</p>
              </div>
              <div>
                <p className="text-xl font-light text-white">{traffic.bounceRate}%</p>
                <p className="text-[9px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>Bounce rate</p>
              </div>
            </div>
            <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Top Pages</p>
            {traffic.byPage.slice(0, 5).map((p: any) => (
              <BarRow key={p.page} label={p.page} pct={p.pct} value={`${p.pct}%`} />
            ))}
          </section>
        </div>

        {/* ── Geography + Device + Demographics ──────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          <section className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>Visitor Geography</p>
            {traffic.byRegion.map((r: any) => (
              <BarRow key={r.region} label={r.region} pct={r.pct} value={`${r.pct}%`} />
            ))}
          </section>

          <section className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>Device Split</p>
            {traffic.byDevice.map((d: any) => (
              <BarRow key={d.device} label={d.device} pct={d.pct} value={`${d.pct}%`} />
            ))}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Talent Nationality</p>
              {demographics.slice(0, 6).map((d: any) => (
                <div key={d.label} className="flex justify-between items-center py-1.5">
                  <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>{d.label}</p>
                  <span className="text-xs font-medium px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disbursement summary */}
          <section className="border p-6 flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] font-medium tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Disbursements</p>
              <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 border" style={{ color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.12)' }}>
                ENBD API
              </span>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-2xl font-light text-white">{fmtAed(disbursementSummary.disbursedAed)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Disbursed to date</p>
              </div>
              <div>
                <p className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>{fmtAed(disbursementSummary.pendingAed)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Pending / in transfer</p>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-lg font-light text-white">{fmtAed(disbursementSummary.totalAed)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Total committed</p>
              </div>
            </div>
            <p className="text-[9px] mt-4 font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Bank integration: Emirates NBD. All disbursements processed electronically via platform. ENBD API connection pending full go-live.
            </p>
          </section>
        </div>

        {/* ── Disbursements table ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Incentive Disbursements</p>
              <h2 className="text-base font-light text-white">Rebate Payments Ledger</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Emirates NBD Connected</p>
            </div>
          </div>
          <div className="border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  {['Ref', 'Project', 'Applicant', 'Amount', 'Status', 'Submitted', 'Released'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-medium tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {disbursements.map((d: any, i: number) => {
                  const s = STATUS_STYLE[d.status] ?? STATUS_STYLE.pending;
                  return (
                    <tr key={d.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td className="px-4 py-3 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{d.id}</td>
                      <td className="px-4 py-3 text-xs font-medium text-white">{d.projectTitle}</td>
                      <td className="px-4 py-3 text-xs font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>{d.applicant}</td>
                      <td className="px-4 py-3 text-xs font-medium text-white">{fmtAed(d.amountAed)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold tracking-widest uppercase px-2 py-1 ${s.bg} ${s.text}`}>
                          {s.icon}{s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.submittedAt}</td>
                      <td className="px-4 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.releasedAt ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Recent applications ─────────────────────────────────────────── */}
        <section>
          <div className="mb-5">
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Applications</p>
            <h2 className="text-base font-light text-white">Recent Eligibility Submissions</h2>
          </div>
          {recentApplications.length === 0 ? (
            <div className="border p-12 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>No applications yet — they will appear here in real time.</p>
            </div>
          ) : (
            <div className="border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    {['Project', 'Type', 'Budget', 'Est. Rebate', 'Status', 'Submitted'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] font-medium tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((a: any, i: number) => (
                    <tr key={a.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td className="px-4 py-3 text-xs font-medium text-white">{a.projectTitle}</td>
                      <td className="px-4 py-3 text-xs font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>{a.projectType}</td>
                      <td className="px-4 py-3 text-xs text-white">{fmtAed(a.budgetAed)}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: '#FF6B6B' }}>{fmtAed(a.estimatedRebateAed)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1 bg-emerald-900/40 text-emerald-400">{a.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(a.submittedAt).toLocaleDateString('en-AE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Pitch analyses ──────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-3 gap-6 pb-12">
          <div className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Pitch Analyses</p>
            <p className="text-3xl font-light text-white">{fmtNum(kpis.pitchAnalyses)}</p>
            <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>AI feedback sessions to date</p>
          </div>
          <div className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Avg. Session</p>
            <p className="text-3xl font-light text-white">—</p>
            <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>Analytics not yet connected</p>
          </div>
          <div className="border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Conversion Rate</p>
            <p className="text-3xl font-light text-white">—</p>
            <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>Analytics not yet connected</p>
          </div>
        </section>

      </div>
    </div>
  );
}
