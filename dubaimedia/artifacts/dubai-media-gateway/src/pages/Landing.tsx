import { useState } from 'react';
import { Link } from 'wouter';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { useRegisterTalent } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

// ── Service gallery data ────────────────────────────────────────────────────
const services = [
  {
    title: 'Eligibility',
    desc: 'Calculate your indicative production rebate — up to 40% of qualifying Dubai spend.',
    path: '/eligibility',
    accent: '#2E6F9E',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    tag: 'Incentives',
  },
  {
    title: 'AI Pitch Feedback',
    desc: 'Expert rule-based analysis on your script or pitch — strengths, risks, next steps.',
    path: '/feedback',
    accent: '#0D2144',
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
    tag: 'Development',
  },
  {
    title: 'Talent Registry',
    desc: 'Browse 200+ verified Emirati and international crew across every department.',
    path: '/talent',
    accent: '#1A3A5C',
    img: 'https://images.unsplash.com/photo-1543461131-a2dfe2d3c91c?w=600&q=80',
    tag: 'Crew',
  },
  {
    title: 'Crew Match',
    desc: 'Auto-assemble a department-ready team matched to your shoot schedule.',
    path: '/crew-match',
    accent: '#8B2500',
    img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
    tag: 'Production',
  },
  {
    title: 'Venues & Locations',
    desc: 'Reserve soundstages, iconic hotels and outdoor locations — permits included.',
    path: '/venues',
    accent: '#4E789A',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    tag: 'Locations',
  },
  {
    title: 'The Gateway Hub',
    desc: 'By approval only — co-working, edit suites, screening and mentor access.',
    path: '/hub',
    accent: '#2C1810',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    tag: 'Space',
  },
  {
    title: 'Investor Network',
    desc: 'Connect your pre-qualified slate with regional and international capital.',
    path: '/investors',
    accent: '#0A2540',
    img: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&q=80',
    tag: 'Finance',
  },
  {
    title: 'Permits & Legal',
    desc: 'Generate tailored location and legal requirements for your production in Dubai.',
    path: '/permits',
    accent: '#1C3A1C',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
    tag: 'Compliance',
  },
];

// ── Iconic Dubai landmark shots from top films ───────────────────────────────
const LANDMARK_GALLERY = [
  {
    film: 'Mission: Impossible — Ghost Protocol',
    year: '2011',
    landmark: 'Burj Khalifa',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=90',
    size: 'tall',   // spans 2 rows in col 1
  },
  {
    film: 'Fast & Furious 7',
    year: '2015',
    landmark: 'Burj Al Arab',
    img: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=700&q=90',
    size: 'normal',
  },
  {
    film: 'Star Wars: The Force Awakens',
    year: '2015',
    landmark: 'Arabian Desert',
    img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=700&q=90',
    size: 'normal',
  },
  {
    film: 'Six Underground',
    year: '2019',
    landmark: 'Dubai Marina',
    img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=700&q=90',
    size: 'normal',
  },
  {
    film: 'Syriana',
    year: '2005',
    landmark: 'Old Dubai',
    img: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=700&q=90',
    size: 'normal',
  },
];

const DISCIPLINES = [
  'Directing', 'Acting', 'Cinematography', 'CGI & VFX',
  'Sound', 'Production', 'Post Production', 'Screenwriting', 'Other',
];

// ── Register modal ────────────────────────────────────────────────────────────
function TalentRegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: register, isPending } = useRegisterTalent();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    register(
      {
        data: {
          name: f.get('name') as string,
          nationality: f.get('nationality') as string,
          department: f.get('department') as string,
          yearsExperience: parseInt(f.get('years') as string, 10),
          bio: f.get('bio') as string,
          portfolioUrl: f.get('portfolioUrl') as string,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Application received', description: 'Our team will verify and publish your profile within 48 hours.' });
          onClose();
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white border border-card-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">

          {/* Header */}
          <div className="px-8 py-6 border-b border-border flex justify-between items-start" style={{ background: 'radial-gradient(ellipse 120% 140% at 80% 50%, #9EC4D8 0%, #5C87A2 100%)' }}>
            <div>
              <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Dubai Media Gateway — Talent Registry
              </p>
              <Dialog.Title className="text-xl font-light text-white">
                Join the Registry
              </Dialog.Title>
              <Dialog.Description className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Get discovered by international productions filming in Dubai.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/40 hover:text-white mt-1 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="p-8 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Full Name</label>
                  <input required name="name" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Nationality</label>
                  <input required name="nationality" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Discipline</label>
                  <select required name="department" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select</option>
                    {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Years Experience</label>
                  <input required type="number" name="years" min="0" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Portfolio / Reel URL</label>
                <input name="portfolioUrl" type="url" placeholder="https://" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Professional Bio &amp; Key Credits</label>
                <textarea required name="bio" rows={3} placeholder="Briefly describe your experience and notable projects..." className="flex w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>
              <div className="pt-3">
                <button type="submit" disabled={isPending} className="w-full h-10 text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all border border-white/30 text-white hover:bg-white hover:text-foreground" style={{ backgroundColor: 'transparent' }}>
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit to Registry
                </button>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-2 font-light">
                  Profiles are verified and published within 48 hours. No fee required.
                </p>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">

      {/* ══ Hero ══════════════════════════════════════════════════════════════ */}
      <section
        className="w-full min-h-[92vh] relative overflow-hidden flex items-stretch"
        style={{ background: 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)' }}
      >
        {/* Strong white bloom — centre right */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 70% at 74% 40%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, transparent 70%)' }} />
        {/* Left-edge soft fill */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 45% 60% at 5% 35%, rgba(255,255,255,0.10) 0%, transparent 55%)' }} />
        {/* Top hairline */}
        <div className="absolute top-0 left-0 h-[1px] pointer-events-none" style={{ width: '60%', background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.0) 100%)' }} />
        {/* Diagonal light shafts */}
        <div className="absolute pointer-events-none" style={{ top: '-10%', left: '6%', width: '1px', height: '130%', background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 75%)', transform: 'rotate(18deg)', transformOrigin: 'top left' }} />
        <div className="absolute pointer-events-none" style={{ top: '-10%', left: '16%', width: '1px', height: '120%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 65%)', transform: 'rotate(18deg)', transformOrigin: 'top left' }} />
        {/* Red bloom bottom-left */}
        <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: '28%', height: '28%', background: 'radial-gradient(ellipse at 0% 100%, rgba(164,0,1,0.22) 0%, transparent 70%)' }} />
        {/* Column divider */}
        <div className="absolute top-0 bottom-0 hidden md:block pointer-events-none" style={{ left: '50%', width: '1px', background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.15) 75%, transparent 100%)' }} />

        {/* Left: headline */}
        <div className="relative z-10 flex flex-col justify-end pb-20 md:pb-28 pt-32 px-6 md:px-10 md:w-1/2">
          <div className="max-w-xl">
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Dubai Films &amp; Games Commission — Production Gateway
            </p>
            <h1 className="font-light leading-[1.0] tracking-[-0.02em] mb-8" style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', color: '#FFFFFF', textShadow: '0 0 80px rgba(255,255,255,0.18)' }}>
              Film in<br />Dubai.
            </h1>
            <p className="text-base md:text-lg font-light max-w-sm leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Incentive eligibility, crew, venues, permits and investor matching — one application, one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-10">
              <Link href="/eligibility" className="link-shine text-sm font-medium tracking-[0.06em] underline underline-offset-4 decoration-1" style={{ '--link-tracking': '0.06em', color: 'rgba(255,255,255,0.90)', textDecorationColor: 'rgba(255,255,255,0.35)' } as React.CSSProperties} data-testid="btn-hero-eligibility">
                Check eligibility →
              </Link>
              <Link href="/feedback" className="link-shine text-sm font-medium tracking-[0.06em] underline underline-offset-4 decoration-1" style={{ '--link-tracking': '0.06em', color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.25)' } as React.CSSProperties} data-testid="btn-hero-feedback">
                Pitch feedback →
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Landmark gallery grid */}
        <div className="relative z-10 hidden md:flex flex-col justify-center py-12 pr-8 pl-8 md:w-1/2">
          <p className="text-[9px] font-medium tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Iconic Locations · Filmed in Dubai
          </p>

          {/* 2-col grid: col-left is one tall card; col-right is 2 stacked cards, then a wide card below */}
          <div className="grid grid-cols-2 gap-2 h-[68vh]">

            {/* Col left — single tall card (Burj Khalifa / MI:GP) */}
            <div className="relative overflow-hidden group row-span-2" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <img src={LANDMARK_GALLERY[0].img} alt={LANDMARK_GALLERY[0].landmark} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: 'center' }} loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(20,55,85,0.90) 100%)' }} />
              {/* White shimmer top-right */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 15%, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-0.5 mb-3 inline-block" style={{ backgroundColor: '#2E6F9E', color: 'white' }}>
                  {LANDMARK_GALLERY[0].landmark}
                </span>
                <p className="text-white font-medium text-sm leading-tight mb-1">{LANDMARK_GALLERY[0].film}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.50)' }}>{LANDMARK_GALLERY[0].year}</p>
              </div>
            </div>

            {/* Col right top — Burj Al Arab / F&F7 */}
            <div className="relative overflow-hidden group" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <img src={LANDMARK_GALLERY[1].img} alt={LANDMARK_GALLERY[1].landmark} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(20,55,85,0.88) 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[8px] font-semibold tracking-[0.18em] uppercase px-1.5 py-0.5 mb-2 inline-block" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                  {LANDMARK_GALLERY[1].landmark}
                </span>
                <p className="text-white text-xs font-medium leading-snug">{LANDMARK_GALLERY[1].film}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{LANDMARK_GALLERY[1].year}</p>
              </div>
            </div>

            {/* Col right bottom — Arabian Desert / Star Wars */}
            <div className="relative overflow-hidden group" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <img src={LANDMARK_GALLERY[2].img} alt={LANDMARK_GALLERY[2].landmark} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(20,55,85,0.88) 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[8px] font-semibold tracking-[0.18em] uppercase px-1.5 py-0.5 mb-2 inline-block" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                  {LANDMARK_GALLERY[2].landmark}
                </span>
                <p className="text-white text-xs font-medium leading-snug">{LANDMARK_GALLERY[2].film}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{LANDMARK_GALLERY[2].year}</p>
              </div>
            </div>

          </div>

          {/* Bottom strip — 2 more across full width */}
          <div className="grid grid-cols-2 gap-2 mt-2" style={{ height: '100px' }}>
            {LANDMARK_GALLERY.slice(3).map((item, i) => (
              <div key={i} className="relative overflow-hidden group" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <img src={item.img} alt={item.landmark} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: 'center 40%' }} loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(20,55,85,0.85) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-[11px] font-medium leading-snug">{item.film}</p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.landmark} · {item.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ticker ──────────────────────────────────────────────────── */}
      <section className="w-full border-y py-4" style={{ backgroundColor: '#2E6F9E', borderColor: 'rgba(255,255,255,0.18)' }}>
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-6 md:gap-14 text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {['30–40% indicative rebate', '1 application, 7 services', 'Emirati talent registered first', 'Festival submissions open'].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.50)' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="w-full bg-white border-b border-border py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 md:gap-24">
            <div className="md:w-64 flex-shrink-0">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-light leading-tight">Three steps to production-ready.</h2>
            </div>
            <div className="flex-1">
              {[
                { n: '01', title: 'Upload your project', body: 'Share details and synopsis in our secure, encrypted platform. Scripts reviewed only for eligibility.' },
                { n: '02', title: 'See what you qualify for', body: 'Instantly view your indicative rebate, applicable bonuses and matching grants or incentives.' },
                { n: '03', title: 'Build and shoot in Dubai', body: 'Hire verified local crew, secure permits and book studio space — in one click.' },
              ].map((step) => (
                <div
                  key={step.n}
                  className="group flex gap-8 items-start border-t border-border pt-8 pb-8 px-4 -mx-4 cursor-default transition-all duration-300"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2E6F9E')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground/60 group-hover:text-white/50 flex-shrink-0 w-6 pt-0.5 transition-colors duration-300">{step.n}</span>
                  <div>
                    <h3 className="text-lg font-medium mb-2 group-hover:text-white transition-colors duration-300">{step.title}</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed font-light group-hover:text-white/70 transition-colors duration-300">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Services — typographic tile grid ════════════════════════════════ */}
      <section className="w-full bg-white border-b border-border py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">Platform</p>
              <h2 className="text-3xl md:text-4xl font-light leading-tight">Core services.</h2>
            </div>
            <p className="text-sm font-light text-muted-foreground max-w-xs leading-relaxed">
              Every tool a production needs to film in Dubai — from first calculation to final permit.
            </p>
          </div>

          {/* 4-col typographic grid — hairline borders, no images */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {services.map((s, i) => (
              <Link
                key={s.path}
                href={s.path}
                className="group relative flex flex-col justify-between bg-white p-7 transition-all duration-300"
                style={{ minHeight: '260px' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2E6F9E')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                {/* Number + tag row */}
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-medium tracking-[0.16em] text-foreground/50 group-hover:text-white/55 transition-colors duration-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-0.5 border border-foreground/25 text-foreground/60 group-hover:border-white/30 group-hover:text-white/70 transition-colors duration-300">
                    {s.tag}
                  </span>
                </div>

                {/* Service name */}
                <div className="mt-auto pt-10">
                  <h3 className="text-xl md:text-2xl font-light leading-snug text-foreground mb-3 group-hover:text-white transition-colors duration-300">
                    {s.title}
                  </h3>
                  <p className="text-xs font-light text-foreground/75 leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                    {s.desc}
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-6 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] uppercase text-foreground/55 group-hover:text-white/80 transition-colors duration-300">
                  Explore
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ══ Talent Registry CTA ═══════════════════════════════════════════════ */}
      <section className="w-full border-b border-border py-20" style={{ background: 'radial-gradient(ellipse 90% 100% at 60% 40%, #C8E4F2 0%, #5B9AC4 40%, #2E6F9E 80%, #1C5480 100%)' }}>
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <p className="text-[9px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.60)' }}>
                Talent Registry
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-3">
                Are you a film or media<br className="hidden md:block" /> specialist?
              </h2>
              <p className="text-sm font-light max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Join Dubai's verified production registry and be selected for international shoots, Gulf co-productions and gateway projects — at no cost.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={() => setRegisterOpen(true)}
                className="h-11 px-8 text-[11px] font-medium tracking-[0.16em] uppercase text-white border transition-all hover:bg-white hover:text-foreground whitespace-nowrap"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Register as talent →
              </button>
              <Link
                href="/talent"
                className="link-shine h-11 px-8 text-[11px] font-medium tracking-[0.16em] uppercase flex items-center whitespace-nowrap"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Browse registry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-32" style={{ background: 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)' }}>
        <div className="container mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.60)' }}>Membership</p>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-3">
              First pitch analysis<br />is free.
            </h2>
            <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Membership unlocks unlimited analyses, crew matching and investor access.
            </p>
          </div>
          <Link href="/membership" className="link-shine text-sm font-medium tracking-[0.06em] underline underline-offset-4 decoration-1 whitespace-nowrap" style={{ '--link-tracking': '0.06em', color: 'rgba(255,255,255,0.65)', textDecorationColor: 'rgba(255,255,255,0.25)' } as React.CSSProperties} data-testid="btn-footer-membership">
            View memberships →
          </Link>
        </div>
      </section>

      {/* Talent register modal */}
      <TalentRegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

    </div>
  );
}
