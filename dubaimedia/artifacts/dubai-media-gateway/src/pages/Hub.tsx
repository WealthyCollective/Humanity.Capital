import { useState } from 'react';
import { useApplyForHub } from '@workspace/api-client-react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BLUE_GRADIENT = 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)';

const SPACES = [
  {
    id: 'hot_desk',
    label: 'Hot Desk',
    desc: 'Flexible daily access. High-speed fibre, shared meeting rooms, printing.',
    note: 'From AED 250 / day',
  },
  {
    id: 'resident_desk',
    label: 'Resident Desk',
    desc: 'Dedicated desk in a private pod. Lock-up storage, priority room booking.',
    note: 'From AED 3,200 / month',
  },
  {
    id: 'edit_suite',
    label: 'Edit Suite',
    desc: 'Acoustically treated bays. Avid / DaVinci. Calibrated reference monitors. Short or long-term block.',
    note: 'From AED 1,800 / day',
  },
  {
    id: 'screening_room',
    label: 'Screening Room',
    desc: 'DCI 4K, Dolby 5.1, 40 seats. Rushes, client reviews and private premieres.',
    note: 'AED 4,500 / half day',
  },
  {
    id: 'mentor_session',
    label: 'Mentor Match',
    desc: 'One-to-one session with a Gateway resident mentor — script, directing, financing or production strategy.',
    note: 'From AED 900 / hour',
  },
];

const MEMBERSHIP_UNLOCKS = [
  { tier: 'Hub Member',  unlocks: ['All Hub spaces', 'Priority booking', 'Mentor directory access'] },
  { tier: 'Creator',     unlocks: ['Everything in Hub', 'Unlimited pitch analyses', 'Crew Match', 'Festival submissions'] },
  { tier: 'Studio',      unlocks: ['Everything in Creator', 'Investor network access', 'Dedicated production coordinator', 'Government liaison'] },
];

export default function Hub() {
  const { mutate: apply, isPending } = useApplyForHub();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    apply(
      {
        data: {
          workspaceType: f.get('workspaceType') as any,
          startDate: f.get('startDate') as string,
          teamSize: parseInt(f.get('teamSize') as string, 10),
          projectSummary: f.get('projectSummary') as string,
          contactEmail: f.get('contactEmail') as string,
        },
      },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: BLUE_GRADIENT, minHeight: '60vh' }}>
        <div className="text-center px-6 py-24 max-w-lg">
          <CheckCircle2 className="h-10 w-10 text-white/60 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-4">Application Received.</h2>
          <p className="text-sm font-light leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            The Hub team will review your application and respond within 24 hours. If you need a space today, come and see us in person at Dubai Studio City, Building 3, Level 2.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="link-shine text-[11px] font-medium tracking-[0.18em] uppercase border border-white/25 px-6 py-2.5 text-white/60 hover:bg-white hover:text-foreground transition-all"
            style={{ '--link-tracking': '0.18em' } as React.CSSProperties}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-20 md:py-28"
        style={{ background: BLUE_GRADIENT }}
      >
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          <p
            className="text-[10px] font-medium tracking-[0.2em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.40)' }}
          >
            By approval only
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05] text-white mb-6">
            The Gateway<br />Hub.
          </h1>
          <p
            className="text-base font-light max-w-lg leading-relaxed mb-3"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            A dedicated creative ecosystem for film professionals working in and through Dubai — co-working, edit suites, mentor access and screening.
          </p>
          <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Apply and receive a response within 24 hours. Need a space today?{' '}
            <a
              href="mailto:hub@dubaimediagateway.ae"
              className="link-shine underline underline-offset-4"
              style={{ '--link-tracking': '0em', color: 'rgba(255,255,255,0.55)', textDecorationColor: 'rgba(255,255,255,0.2)' } as React.CSSProperties}
            >
              Come and see us in person.
            </a>
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="bg-white flex-1">
        <div className="container mx-auto px-6 md:px-10 py-16 max-w-5xl">
          <div className="grid md:grid-cols-5 gap-16">

            {/* ── Left: spaces + membership ──────────────────────────────── */}
            <div className="md:col-span-3 space-y-14">

              {/* Spaces list */}
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                  Spaces &amp; Services
                </p>
                <div className="divide-y divide-border">
                  {SPACES.map((s) => (
                    <div key={s.id} className="py-5 flex justify-between items-start gap-6 group">
                      <div>
                        <h3 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors duration-200">
                          {s.label}
                        </h3>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-xs">
                          {s.desc}
                        </p>
                        {s.id === 'mentor_session' && (
                          <p className="text-[10px] tracking-wide uppercase text-muted-foreground/60 mt-1.5">
                            Additional fees apply — consulting with a specialist
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-light whitespace-nowrap shrink-0 text-right">
                        {s.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Membership tiers */}
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                  Membership — Auto-unlock for All Services
                </p>
                <div className="divide-y divide-border border-t border-b border-border">
                  {MEMBERSHIP_UNLOCKS.map((m) => (
                    <div key={m.tier} className="py-4 flex gap-6 items-start">
                      <p className="text-xs font-medium w-28 shrink-0">{m.tier}</p>
                      <ul className="space-y-1">
                        {m.unlocks.map((u) => (
                          <li key={u} className="text-xs text-muted-foreground font-light flex items-start gap-2">
                            <span className="text-primary mt-0.5">—</span>{u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-3 font-light">
                  Hub membership auto-unlocks eligibility, crew match and festival submissions. Upgrade to Creator or Studio for full platform access.
                </p>
              </div>

              {/* Location */}
              <div className="border-t border-border pt-8">
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  Location
                </p>
                <p className="text-sm font-medium">Dubai Studio City, Building 3, Level 2</p>
                <p className="text-xs text-muted-foreground font-light mt-1">
                  Open Sunday–Thursday, 09:00–18:00. Walk-ins welcome — subject to availability.
                </p>
              </div>
            </div>

            {/* ── Right: application form ────────────────────────────────── */}
            <div className="md:col-span-2">
              <div className="bg-white border border-card-border p-7 sticky top-20">
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-1">Apply</p>
                <h2 className="text-lg font-light mb-6">Request a Space</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                      Space Type
                    </label>
                    <select
                      required
                      name="workspaceType"
                      className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {SPACES.filter(s => s.id !== 'mentor_session').map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                      <option value="mentor_session">Mentor Session</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                        Start Date
                      </label>
                      <input
                        required
                        type="date"
                        name="startDate"
                        className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                        Team Size
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        defaultValue="1"
                        name="teamSize"
                        className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                      Project / Need Summary
                    </label>
                    <textarea
                      required
                      name="projectSummary"
                      rows={3}
                      placeholder="What are you working on?"
                      className="flex w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                      Contact Email
                    </label>
                    <input
                      required
                      type="email"
                      name="contactEmail"
                      className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-9 text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all border text-foreground hover:bg-foreground hover:text-white"
                      style={{ borderColor: 'hsl(var(--border))' }}
                    >
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Apply — Response within 24 hrs
                    </button>
                    <p className="text-[10px] text-muted-foreground/60 text-center mt-2 font-light">
                      By approval only. Applications reviewed Monday–Friday.
                    </p>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
