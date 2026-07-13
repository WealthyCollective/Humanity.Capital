import { useState } from 'react';
import { useSubmitFestivalEntry } from '@workspace/api-client-react';
import { Loader2, Ticket, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as Dialog from '@radix-ui/react-dialog';

// DIFF gallery images — cinematic Dubai & film festival photography
const DIFF_GALLERY = [
  { img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&q=85', caption: 'Dubai at night' },
  { img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85', caption: 'Burj Khalifa' },
  { img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=85', caption: 'Filmmaking' },
  { img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900&q=85', caption: 'Cinema' },
  { img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=85', caption: 'Red carpet' },
  { img: 'https://images.unsplash.com/photo-1543461131-a2dfe2d3c91c?w=900&q=85', caption: 'Director' },
];

const INTEREST_TYPES = ['Headline Sponsor', 'Section Partner', 'Industry Partner', 'Jury Participation', 'Press / Media', 'General Attendance'];

function SponsorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setDone(true); }, 900);
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) { onClose(); setDone(false); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border flex justify-between items-start" style={{ background: 'radial-gradient(ellipse 120% 140% at 80% 50%, #9EC4D8 0%, #5C87A2 100%)' }}>
            <div>
              <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Dubai International Film Festival — 2026
              </p>
              <Dialog.Title className="text-xl font-light text-white">Register Interest</Dialog.Title>
              <Dialog.Description className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sponsor, partner or participate in the relaunch edition.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/35 hover:text-white transition-colors mt-1"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </div>

          <div className="p-8">
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Interest Registered</h3>
                <p className="text-sm text-muted-foreground font-light">Our partnerships team will be in touch within 5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Name</label>
                    <input required name="name" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Organisation</label>
                    <input required name="org" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Email</label>
                  <input required type="email" name="email" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Participation Type</label>
                  <select required name="type" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select</option>
                    {INTEREST_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Message (optional)</label>
                  <textarea name="message" rows={2} className="flex w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
                <button type="submit" disabled={sending} className="w-full h-10 text-white text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-2 mt-2" style={{ backgroundColor: '#4E789A' }}>
                  {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Interest
                </button>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Festival() {
  const { mutate: submit, isPending } = useSubmitFestivalEntry();
  const { toast } = useToast();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [sponsorOpen, setSponsorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit({
      data: {
        filmTitle: formData.get('filmTitle') as string,
        runtime: parseInt(formData.get('runtime') as string, 10),
        category: formData.get('category') as string,
        premiereStatus: formData.get('premiereStatus') as string,
        screenerUrl: formData.get('screenerUrl') as string,
        directorName: formData.get('directorName') as string,
        contactEmail: formData.get('contactEmail') as string,
      }
    }, {
      onSuccess: (data) => {
        setSubmissionId(data.submissionId);
        toast({ title: 'Submission complete', description: 'Your film has been entered into the festival.' });
      }
    });
  };

  if (submissionId) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center flex-1 flex flex-col justify-center">
        <div className="bg-white border border-card-border p-10 rounded-sm shadow-md">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-2 tracking-tight">Submission Confirmed</h2>
          <div className="bg-secondary px-4 py-3 rounded-sm font-mono text-lg font-bold text-foreground my-6 border border-border">
            {submissionId}
          </div>
          <p className="text-muted-foreground mb-8">
            Your film has been successfully submitted to the Dubai International Film Festival. The programming team will review your screener.
          </p>
          <button onClick={() => setSubmissionId(null)} className="inline-flex h-10 w-full items-center justify-center border border-foreground/20 px-4 text-sm font-medium transition-colors hover:bg-foreground hover:text-white">
            Submit Another Film
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col">

      {/* ══ DIFF Hero — deep navy with gallery ══════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ background: 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)', minHeight: '72vh' }}>

        {/* Light beam */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 10% 30%, rgba(255,255,255,0.08) 0%, transparent 65%)' }} />
        <div className="absolute top-0 left-0 h-[1px] w-1/2 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />

        <div className="container mx-auto px-6 md:px-10 pt-20 pb-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
            {/* Left: title */}
            <div className="max-w-lg">
              <p className="text-[9px] font-medium tracking-[0.26em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Dubai International Film Festival · Est. 2004
              </p>
              <h1 className="font-light text-white leading-[1.0] mb-5" style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)', textShadow: '0 0 60px rgba(255,255,255,0.12)' }}>
                DIFF<br />Returns.
              </h1>
              <p className="text-base font-light leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.50)' }}>
                The Dubai International Film Festival is returning in 2026. World-class cinema, emerging regional voices, and the Gulf's premier red-carpet moment — back where it belongs.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setSponsorOpen(true)}
                  className="h-11 px-7 text-white text-[11px] font-medium tracking-[0.18em] uppercase border transition-all hover:bg-white hover:text-foreground"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Register Interest — Sponsor / Partner
                </button>
                <a href="#entry-form" className="link-shine h-11 px-7 flex items-center text-[11px] font-medium tracking-[0.18em] uppercase" style={{ '--link-tracking': '0.18em', color: 'rgba(255,255,255,0.4)' } as React.CSSProperties}>
                  Submit a Film ↓
                </a>
              </div>
            </div>
            {/* Right: stats — DIFF historical record (source: DIFF official archive) */}
            <div className="flex gap-8 md:gap-12 flex-shrink-0">
              {[
                { v: '13', l: 'Editions held' },
                { v: '50+', l: 'Countries represented' },
                { v: '300+', l: 'Films screened' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className="text-3xl md:text-4xl font-light text-white">{s.v}</p>
                  <p className="text-[9px] font-medium tracking-[0.18em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {DIFF_GALLERY.map((item, i) => (
              <div key={i} className={`relative overflow-hidden group ${i === 0 ? 'col-span-2 row-span-1' : ''}`} style={{ borderRadius: '2px', aspectRatio: i === 0 ? '2/1.1' : '1/1' }}>
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(7,23,39,0.75) 100%)' }} />
                <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: '#2E6F9E', opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partnership tiers ─────────────────────────────────────────────── */}
      <section className="w-full border-b border-border py-16" style={{ backgroundColor: '#2E6F9E' }}>
        <div className="container mx-auto px-6 md:px-10">
          <p className="text-[9px] font-medium tracking-[0.24em] uppercase mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Partnerships & Sponsorship
          </p>
          <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { tier: 'Headline Sponsor', desc: 'Festival naming rights, red carpet presence, opening/closing night, full digital integration.', tag: 'Most visibility' },
              { tier: 'Section Partner', desc: 'Dedicated section branding, jury seat, VIP access and curated guest list of 50.', tag: '' },
              { tier: 'Industry Partner', desc: 'Panel presence, market access, networking dinners and delegate passes for your team.', tag: '' },
            ].map(p => (
              <div key={p.tier} className="p-8 relative" style={{ backgroundColor: '#2E6F9E' }}>
                {p.tag && (
                  <span className="absolute top-6 right-6 text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5" style={{ backgroundColor: '#2E6F9E', color: 'white' }}>
                    {p.tag}
                  </span>
                )}
                <h3 className="text-base font-medium text-white mb-3">{p.tier}</h3>
                <p className="text-xs font-light leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.desc}</p>
                <button onClick={() => setSponsorOpen(true)} className="link-shine text-[10px] font-medium tracking-[0.16em] uppercase underline underline-offset-4 decoration-1" style={{ '--link-tracking': '0.16em', color: 'rgba(255,255,255,0.45)', textDecorationColor: 'rgba(255,255,255,0.2)' } as React.CSSProperties}>
                  Register interest →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Entry form ────────────────────────────────────────────────────── */}
      <div id="entry-form" className="w-full">

        {/* Cinematic banner */}
        <div
          className="relative w-full overflow-hidden flex flex-col items-center justify-center text-center"
          style={{ minHeight: '320px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=90"
            alt="Dubai International Film Festival"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 35%' }}
          />
          {/* Rich dark overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,12,16,0.55) 0%, rgba(10,12,16,0.82) 100%)' }} />
          {/* Blue bloom */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 40%, rgba(44,110,158,0.30) 0%, transparent 65%)' }} />

          <div className="relative z-10 px-6 py-14">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-white/20 mb-6" style={{ borderRadius: '2px', backgroundColor: 'rgba(164,0,1,0.25)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="1"/>
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-3">
              Dubai International<br />Film Festival
            </h2>
            <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Submissions open for the relaunch edition.
            </p>
          </div>
        </div>

        <div className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="mb-10">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">Film Submissions</p>
            <h2 className="text-3xl md:text-4xl font-light leading-tight">Official Entry Form.</h2>
            <p className="text-sm text-muted-foreground font-light mt-3">Submissions open for the 2026 relaunch edition. All genres and origins welcome.</p>
          </div>

          <div className="bg-white border border-card-border p-6 sm:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Film Title</label>
                <input required name="filmTitle" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Director</label>
                  <input required name="directorName" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Runtime (mins)</label>
                  <input required type="number" name="runtime" min="1" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Category</label>
                  <select required name="category" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select</option>
                    <option>Narrative Feature</option>
                    <option>Documentary Feature</option>
                    <option>Short Film</option>
                    <option>Emirati Showcase</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Premiere Status</label>
                  <select required name="premiereStatus" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select</option>
                    <option>World Premiere</option>
                    <option>International Premiere</option>
                    <option>MENA Premiere</option>
                    <option>UAE Premiere</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Secure Screener URL</label>
                <input required type="url" name="screenerUrl" placeholder="https://vimeo.com/..." className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                <p className="text-xs text-muted-foreground">Include password in the URL or email it separately.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground">Contact Email</label>
                <input required type="email" name="contactEmail" className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <button type="submit" disabled={isPending} className="w-full h-11 mt-6 text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all border text-foreground hover:bg-foreground hover:text-white" style={{ borderColor: 'hsl(var(--border))' }}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit to DIFF 2026
              </button>
            </form>
          </div>
        </div>
        </div>{/* /bg-white */}
      </div>{/* /entry-form */}

      <SponsorModal open={sponsorOpen} onClose={() => setSponsorOpen(false)} />
    </div>
  );
}
