import { useState } from 'react';
import { useListTalent, useRegisterTalent } from '@workspace/api-client-react';
import { Star, CheckCircle, Loader2, X, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Directing', value: 'Directing' },
  { label: 'Acting', value: 'Acting' },
  { label: 'Cinematography', value: 'Cinematography' },
  { label: 'CGI & VFX', value: 'CGI & VFX' },
  { label: 'Sound', value: 'Sound' },
  { label: 'Production', value: 'Production' },
  { label: 'Post Production', value: 'Post Production' },
  { label: 'Mentor', value: 'Mentor' },
];

export default function Talent() {
  const [category, setCategory] = useState('');
  const [emiratiOnly, setEmiratiOnly] = useState(false);
  const [reelPerson, setReelPerson] = useState<{ name: string; reelUrl: string } | null>(null);
  const [tab, setTab] = useState<'browse' | 'register'>('browse');
  const { toast } = useToast();

  const { data: talent, isLoading } = useListTalent({
    department: category || undefined,
    emiratiOnly: emiratiOnly || undefined,
  });
  const { mutate: register, isPending: isRegistering } = useRegisterTalent();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
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
          toast({ title: 'Application submitted', description: 'Your profile is pending verification.' });
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  // Filter by category client-side (backend filters by department)
  const filtered = talent?.filter((p) =>
    !category || (p as any).category === category || p.department === category
  );

  return (
    <div className="container mx-auto px-6 md:px-10 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-2">Registry</p>
        <h1 className="text-3xl md:text-4xl font-light mb-1">National Talent Registry</h1>
        <div className="h-px w-10 bg-primary mt-4"></div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-8 border-b border-border mb-10">
        {(['browse', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors ${
              tab === t
                ? 'text-foreground border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'browse' ? 'Browse' : 'Register Profile'}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`text-[10px] font-medium tracking-[0.14em] uppercase px-3 py-1.5 border transition-colors ${
                  category === c.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-white border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
            <label className="flex items-center gap-2 text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground cursor-pointer ml-4 border-l border-border pl-4">
              <input
                type="checkbox"
                checked={emiratiOnly}
                onChange={(e) => setEmiratiOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              Emirati priority
            </label>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(filtered ?? talent)?.map((person) => {
                const p = person as typeof person & {
                  category?: string;
                  reelUrl?: string | null;
                  imageUrl?: string | null;
                  credits?: string[];
                };
                const isMentor = p.category === 'Mentor';
                return (
                  <div
                    key={person.id}
                    className="bg-white border border-card-border flex flex-col overflow-hidden hover:border-foreground/30 transition-colors"
                  >
                    {/* Headshot / image */}
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={person.name}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No photo
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {person.isEmirati && (
                          <span className="bg-primary text-white text-[9px] font-semibold px-2 py-0.5 tracking-widest uppercase">
                            Emirati
                          </span>
                        )}
                        {isMentor && (
                          <span className="bg-foreground text-background text-[9px] font-semibold px-2 py-0.5 tracking-widest uppercase">
                            Mentor
                          </span>
                        )}
                      </div>
                      {person.isVerified && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-base font-medium">{person.name}</h3>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground">
                            {p.category || person.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-medium shrink-0">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {person.rating}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-1">{person.nationality} · {person.yearsExperience} yrs exp</p>

                      {/* Credits */}
                      {p.credits?.length ? (
                        <ul className="mt-2 mb-3 space-y-0.5">
                          {p.credits.slice(0, 2).map((c, i) => (
                            <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">—</span>{c}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <p className="text-xs text-foreground/70 line-clamp-2 flex-1 mb-4 leading-relaxed font-light">
                        {person.bio || 'No biography on file.'}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                        {p.reelUrl ? (
                          <button
                            onClick={() => setReelPerson({ name: person.name, reelUrl: p.reelUrl! })}
                            className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-primary border border-primary px-3 py-1.5 hover:bg-primary hover:text-white transition-colors"
                          >
                            <Play className="h-3 w-3" /> View Reel
                          </button>
                        ) : person.portfolioUrl ? (
                          <a
                            href={person.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground border border-border px-3 py-1.5 hover:border-foreground hover:text-foreground transition-colors"
                          >
                            Portfolio →
                          </a>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/50">Portfolio on request</span>
                        )}
                        {isMentor && (
                          <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-foreground/50 border border-border px-3 py-1.5 ml-auto">
                            By appointment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(filtered ?? talent)?.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border text-sm">
                  No talent found matching your criteria.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'register' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-card-border p-8">
            <h2 className="text-lg font-medium mb-6">Create Your Profile</h2>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Full Name</label>
                  <input required name="name" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Nationality</label>
                  <input required name="nationality" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Discipline</label>
                  <select required name="department" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select</option>
                    {CATEGORIES.slice(1).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Professional Bio</label>
                <textarea required name="bio" rows={4} className="flex w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>
              <div className="pt-4 border-t border-border">
                <button type="submit" disabled={isRegistering} className="h-9 px-8 bg-primary text-white text-[11px] font-medium tracking-[0.14em] uppercase hover:bg-primary/90 flex items-center gap-2">
                  {isRegistering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reel modal */}
      {reelPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setReelPerson(null)}>
          <div className="w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">{reelPerson.name} — Showreel</p>
              <button onClick={() => setReelPerson(null)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={reelPerson.reelUrl}
                title={`${reelPerson.name} reel`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
