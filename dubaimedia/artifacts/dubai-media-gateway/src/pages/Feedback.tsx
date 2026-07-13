import { useState } from 'react';
import { useSubmitFeedback } from '@workspace/api-client-react';
import type { PitchAnalysis } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle, FileText, Sparkles } from 'lucide-react';

const schema = z.object({
  logline: z.string().min(10, 'Required').max(300, 'Max 300 characters'),
  synopsis: z.string().min(10, 'Required').max(2000, 'Max 2000 characters'),
  genre: z.string().min(1, 'Required'),
  targetAudience: z.string().min(1, 'Required'),
  format: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

// ── Gudda Guddi example data ─────────────────────────────────────
const GUDDA_GUDDI_FEEDBACK: FormData = {
  format: 'Feature Film',
  genre: 'Family Drama',
  targetAudience: 'Families | Global South Diaspora',
  logline:
    'A city that once turned its sky into fire — kites by the thousand, strings laced with glass — until the festival swallowed its own children and went quiet for twenty-five years. Into that silence arrives a love story.',
  synopsis:
    'Gudda Guddi is set in Lahore, where the Basant kite festival — once a city-wide celebration of colour and sky — was banned after a series of tragedies involving razor-sharp manja string. Twenty-five years of silence have passed. Into that quiet arrives Gudda, a young man who grew up on rooftop kite-flying stories told by his late father, and Guddi, a girl whose family lost someone in the last festival. Their love story unfolds against the city\'s collective memory of what was lost, and its cautious, complicated longing for what might be reclaimed. The film explores cultural pride, grief, forgiveness and the dangerous beauty of tradition. It is a family entertainment picture with deep emotional resonance for the Pakistani diaspora in the UK, USA, Middle East and Europe, positioned for wide theatrical release on Eid ul-Fitr 2027.',
};

export default function Feedback() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<PitchAnalysis | null>(null);
  const [paywall, setPaywall] = useState(false);

  const { mutate: submitForm, isPending } = useSubmitFeedback();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      logline: '',
      synopsis: '',
      genre: 'Drama',
      targetAudience: 'International',
      format: 'Feature Film',
    },
  });

  const loadExample = () => {
    Object.entries(GUDDA_GUDDI_FEEDBACK).forEach(([k, v]) => {
      form.setValue(k as keyof FormData, v);
    });
  };

  const onSubmit = (data: FormData) => {
    setPaywall(false);
    submitForm(
      { data },
      {
        onSuccess: (res) => { setResult(res); },
        onError: (err: unknown) => {
          const e = err as { upgradeRequired?: string };
          if (e?.upgradeRequired) {
            setPaywall(true);
          } else {
            setPaywall(true);
          }
        },
      }
    );
  };

  // ── Paywall ─────────────────────────────────────────────────────
  if (paywall) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center flex-1 flex flex-col justify-center">
        <div className="bg-white border border-card-border p-10 rounded-sm shadow-sm">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3 tracking-tight">Upgrade Required</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Your first analysis was free. Creator and Studio members receive unlimited detailed coverage, scene-level notes and a producer consultation through the Gateway.
          </p>
          <button
            onClick={() => setLocation('/membership')}
            className="inline-flex h-12 w-full items-center justify-center border border-foreground/20 px-8 text-sm font-medium transition-all hover:bg-foreground hover:text-white"
            data-testid="btn-upgrade"
          >
            View Membership Tiers
          </button>
          <button
            onClick={() => setPaywall(false)}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to form
          </button>
        </div>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Pitch Analysis Report</h1>
          <div className="h-px w-12 bg-primary"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-7 mb-8">
          {/* Scores column */}
          <div className="space-y-5">
            <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Scores</h3>
              <div className="space-y-5">
                {result.scores.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{s.dimension}</span>
                      <span className="text-primary font-semibold">{s.score}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${s.score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary border border-card-border p-5 rounded-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Project</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Genre', value: result.genre },
                  { label: 'Format', value: result.format },
                  { label: 'Audience', value: result.targetAudience },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-muted-foreground text-xs">{row.label}</dt>
                    <dd className="font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Analysis columns */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-green-700 mb-4">Strengths</h3>
              <ul className="space-y-3">
                {result.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="h-5 w-5 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70 mb-4">Risks</h3>
              <ul className="space-y-3">
                {result.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="h-5 w-5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Next Steps</h3>
              <ul className="space-y-3">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="h-5 w-5 rounded-full bg-secondary border border-card-border text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-5 text-center text-xs text-muted-foreground uppercase tracking-widest">
          Prepared by the Gateway story team, powered by expert-trained AI.
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="w-full py-14 md:py-20"
        style={{ background: 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)' }}
      >
        <div className="container mx-auto px-6 md:px-10">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Dubai Films &amp; Games Commission
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-white leading-tight">
            AI Pitch<br />Feedback.
          </h1>
          <p className="text-sm font-light mt-4 max-w-md" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Instant, expert-trained analysis of your script or pitch — strengths, risks, and market positioning.
          </p>
        </div>
      </section>

    <div className="container mx-auto px-4 py-12 max-w-3xl flex-1">
      <div className="mb-8">
        {/* Example loader */}
        <button
          type="button"
          onClick={loadExample}
          className="link-shine inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase border border-border px-3 py-1.5 text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors mb-6"
          data-testid="btn-load-feedback-example"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load example: Gudda Guddi
        </button>
      </div>

      <div className="bg-white border border-card-border rounded-sm shadow-sm p-6 sm:p-8 mb-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Format</label>
              <select
                {...form.register('format')}
                className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="select-format"
              >
                <option>Feature Film</option>
                <option>TV Series</option>
                <option>Documentary</option>
                <option>Short Film</option>
                <option>Web Series</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Genre</label>
              <input
                {...form.register('genre')}
                placeholder="e.g. Family Drama"
                className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="input-genre"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Audience</label>
              <input
                {...form.register('targetAudience')}
                placeholder="e.g. Families, 18-35"
                className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="input-audience"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 flex justify-between">
              <span>Logline</span>
              <span className="text-muted-foreground font-normal">{form.watch('logline').length}/300</span>
            </label>
            <textarea
              {...form.register('logline')}
              className="flex min-h-[80px] w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="One or two sentence summary of the story..."
              data-testid="textarea-logline"
            />
            {form.formState.errors.logline && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.logline.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 flex justify-between">
              <span>Synopsis</span>
              <span className="text-muted-foreground font-normal">{form.watch('synopsis').length}/2000</span>
            </label>
            <textarea
              {...form.register('synopsis')}
              className="flex min-h-[240px] w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              placeholder="Full story summary — characters, conflict, themes..."
              data-testid="textarea-synopsis"
            />
            {form.formState.errors.synopsis && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.synopsis.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center border border-foreground/20 px-8 text-sm font-medium transition-all hover:bg-foreground hover:text-white disabled:opacity-40"
            data-testid="btn-submit-feedback"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Analyze Pitch
          </button>

          <p className="text-xs text-center text-muted-foreground">
            First analysis is free per session. Creator and Studio members receive unlimited coverage.
          </p>
        </form>
      </div>
    </div>
    </div>
  );
}
