import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSubmitEligibility } from '@workspace/api-client-react';
import type { RebateBreakdown } from '@workspace/api-client-react';
import { BadgeDollarSign, Check, X, ArrowRight, Loader2, Save, FileText, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  projectType: z.string().min(1, 'Select a project type'),
  projectTitle: z.string().min(1, 'Title is required'),
  logline: z.string().max(240, 'Max 240 characters'),
  budgetAed: z.coerce.number().min(100000, 'Minimum budget 100k AED'),
  dubaiSpendPercent: z.coerce.number().min(0).max(100),
  shootDays: z.coerce.number().min(1),
  emiratiCrewPercent: z.coerce.number().min(0).max(100),
  usesDubaiStudioCity: z.boolean(),
  featuresDubaiLocations: z.boolean(),
  scriptFilename: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Gudda Guddi example data (from the one-pager) ────────────────
const GUDDA_GUDDI_EXAMPLE: Partial<FormData> = {
  projectType: 'Feature film',
  projectTitle: 'Gudda Guddi',
  logline:
    'Kites by the thousand, strings laced with glass — until the festival swallowed its own children and went quiet for twenty-five years. Into that silence: a love story. A girl. A boy. A Lahore that remembers everything and forgives nothing.',
  budgetAed: 3670000,   // ≈ USD 1M (expanded for Dubai Middle East production leg)
  dubaiSpendPercent: 38,
  shootDays: 18,
  emiratiCrewPercent: 35,
  usesDubaiStudioCity: true,
  featuresDubaiLocations: true,
  scriptFilename: '',
};

export default function Eligibility() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<{ rebate: RebateBreakdown; title: string } | null>(null);

  const { mutate: submitForm, isPending } = useSubmitEligibility();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectType: 'Feature film',
      projectTitle: '',
      logline: '',
      budgetAed: 1000000,
      dubaiSpendPercent: 50,
      shootDays: 10,
      emiratiCrewPercent: 10,
      usesDubaiStudioCity: false,
      featuresDubaiLocations: false,
      scriptFilename: '',
    },
  });

  const loadExample = () => {
    Object.entries(GUDDA_GUDDI_EXAMPLE).forEach(([k, v]) => {
      form.setValue(k as keyof FormData, v as never);
    });
    setStep(1);
  };

  const onSubmit = (data: FormData) => {
    submitForm(
      { data: { ...data, scriptFilename: data.scriptFilename || null, scriptFileSize: 0 } },
      {
        onSuccess: (res) => {
          setResult({ rebate: res.rebate, title: data.projectTitle });
        },
      }
    );
  };

  const nextStep = async () => {
    const fieldsByStep: Array<Array<keyof FormData>> = [
      [],
      ['projectType', 'projectTitle', 'logline'],
      ['budgetAed', 'dubaiSpendPercent', 'shootDays'],
      ['emiratiCrewPercent', 'usesDubaiStudioCity', 'featuresDubaiLocations'],
    ];
    const isStepValid = await form.trigger(fieldsByStep[step]);
    if (isStepValid) setStep((s) => Math.min(s + 1, 4));
  };

  const formatAed = (val: number) =>
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val);

  // ── Results screen ──────────────────────────────────────────────
  if (result) {
    const { rebate, title } = result;
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
          <h1 className="text-3xl font-semibold mb-2">Rebate Estimate</h1>
          <div className="h-px w-12 bg-primary"></div>
        </div>

        {rebate.meetsMinimum ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-card-border p-8 rounded-sm shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Estimated Rebate
              </div>
              <div className="text-4xl font-semibold text-primary mb-8">{formatAed(rebate.estimatedRebateAed)}</div>

              <div className="space-y-0 text-sm divide-y divide-border">
                {[
                  { label: 'Base Rate', value: `${rebate.baseRate}%` },
                  { label: 'Emirati / Resident Crew Bonus', value: `+${rebate.emiratiBonus}%`, highlight: rebate.emiratiBonus > 0 },
                  { label: 'Dubai Studio City Bonus', value: `+${rebate.studioBonus}%`, highlight: rebate.studioBonus > 0 },
                  { label: 'Dubai Location Bonus', value: `+${rebate.locationBonus}%`, highlight: rebate.locationBonus > 0 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-3">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-medium ${row.highlight ? 'text-primary' : ''}`}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-semibold">
                  <span>Total Qualifying Rate</span>
                  <span className="text-primary">{rebate.totalRate}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-secondary border border-card-border p-6 rounded-sm">
                <h3 className="font-semibold mb-4">Eligibility Checklist</h3>
                <ul className="space-y-2.5">
                  {[
                    'Meets minimum AED 1M qualifying spend',
                    'Approved production format',
                    'Commercial intent verified',
                    rebate.emiratiBonus > 0 ? 'Local participation threshold met' : null,
                    rebate.studioBonus > 0 ? 'Dubai Studio City facility use confirmed' : null,
                    rebate.locationBonus > 0 ? 'Dubai locations featured' : null,
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
                <h3 className="font-semibold mb-1">What happens next</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Your application will be reviewed within 10 business days. You will be matched to venues and notified of any subsidy options.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setLocation('/dashboard')}
                    className="inline-flex h-10 items-center justify-center border border-foreground/20 px-4 text-sm font-medium transition-colors hover:bg-foreground hover:text-white"
                    data-testid="btn-save-dashboard"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save to dashboard
                  </button>
                  <button
                    onClick={() => setLocation('/feedback')}
                    className="inline-flex h-10 items-center justify-center border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                    data-testid="btn-get-feedback"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Get AI feedback on this pitch
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-card-border p-8 rounded-sm text-center max-w-lg mx-auto shadow-sm">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Below Minimum Threshold</h2>
            <p className="text-muted-foreground text-sm mb-2">
              This production does not meet the minimum qualifying Dubai spend of AED 1,000,000.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              To qualify: increase your total budget, raise Dubai spend percentage above {Math.ceil(1000000 / (rebate.qualifyingSpendAed / (form.getValues('dubaiSpendPercent') || 1)))}%, or plan a longer shoot.
            </p>
            <button
              onClick={() => { setResult(null); setStep(2); }}
              className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              Adjust budget
            </button>
          </div>
        )}
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
            Rebate Eligibility<br />Checker.
          </h1>
          <p className="text-sm font-light mt-4 max-w-md" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Calculate your indicative production rebate — up to 40% of qualifying Dubai spend.
          </p>
        </div>
      </section>

    <div className="container mx-auto px-4 py-12 max-w-2xl flex-1 flex flex-col">
      <div className="mb-8">
        {/* Example loader */}
        <button
          type="button"
          onClick={loadExample}
          className="link-shine inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase border border-border px-3 py-1.5 text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors mb-6"
          data-testid="btn-load-example"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load example: Gudda Guddi
        </button>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-border'}`} />
              <div className={`text-xs mt-1.5 font-medium ${step >= i ? 'text-primary' : 'text-muted-foreground'}`}>
                {i === 1 && 'Project'}{i === 2 && 'Budget'}{i === 3 && 'Local'}{i === 4 && 'Script'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-card-border rounded-sm shadow-sm p-6 sm:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Step 1 — Project details */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Project Type</label>
                <select
                  {...form.register('projectType')}
                  className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="select-project-type"
                >
                  <option>Feature film</option>
                  <option>TV series</option>
                  <option>Documentary</option>
                  <option>Commercial</option>
                  <option>Music video</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Project Title</label>
                <input
                  {...form.register('projectTitle')}
                  className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="input-project-title"
                />
                {form.formState.errors.projectTitle && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.projectTitle.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 flex justify-between">
                  <span>Logline</span>
                  <span className="text-muted-foreground font-normal">{form.watch('logline').length}/240</span>
                </label>
                <textarea
                  {...form.register('logline')}
                  className="flex min-h-[110px] w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Brief summary of the story..."
                  data-testid="textarea-logline"
                />
                {form.formState.errors.logline && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.logline.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Budget */}
          {step === 2 && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 flex justify-between">
                  <span>Total Budget (AED)</span>
                  <span className="text-primary font-semibold">{formatAed(form.watch('budgetAed'))}</span>
                </label>
                <input
                  type="range" min="100000" max="100000000" step="50000"
                  {...form.register('budgetAed')}
                  className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                  data-testid="slider-budget"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>AED 100k</span><span>AED 100M</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 flex justify-between">
                  <span>Dubai Spend (%)</span>
                  <span className="text-primary font-semibold">{form.watch('dubaiSpendPercent')}%</span>
                </label>
                <input
                  type="range" min="0" max="100"
                  {...form.register('dubaiSpendPercent')}
                  className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                  data-testid="slider-dubai-spend"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Shoot Days in Dubai</label>
                <input
                  type="number" min="1"
                  {...form.register('shootDays')}
                  className="flex h-10 w-40 rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="input-shoot-days"
                />
              </div>
              {/* Live preview */}
              <div className="bg-secondary border border-card-border p-4 rounded-sm text-sm">
                <span className="text-muted-foreground">Qualifying Dubai spend: </span>
                <span className="font-semibold text-primary">
                  {formatAed((form.watch('budgetAed') * form.watch('dubaiSpendPercent')) / 100)}
                </span>
                <span className="text-muted-foreground ml-2">
                  {(form.watch('budgetAed') * form.watch('dubaiSpendPercent')) / 100 >= 1000000
                    ? '✓ meets minimum'
                    : '— below AED 1M minimum'}
                </span>
              </div>
            </div>
          )}

          {/* Step 3 — Local participation */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 flex justify-between">
                  <span>Emirati / UAE-Resident Crew (%)</span>
                  <span className="text-primary font-semibold">{form.watch('emiratiCrewPercent')}%</span>
                </label>
                <input
                  type="range" min="0" max="100"
                  {...form.register('emiratiCrewPercent')}
                  className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                  data-testid="slider-emirati-crew"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  +4% bonus at 50%+ &nbsp;·&nbsp; +2% bonus at 30%+
                </p>
              </div>

              {[
                { id: 'usesDubaiStudioCity', label: 'Utilizing Dubai Studio City facilities', bonus: '+3%' },
                { id: 'featuresDubaiLocations', label: 'Features recognisable Dubai landmarks or locations', bonus: '+3%' },
              ].map(({ id, label, bonus }) => (
                <label
                  key={id}
                  htmlFor={id}
                  className="flex items-center justify-between gap-4 bg-secondary/60 border border-card-border p-4 rounded-sm cursor-pointer hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox" id={id}
                      {...form.register(id as 'usesDubaiStudioCity' | 'featuresDubaiLocations')}
                      className="h-4 w-4 accent-primary cursor-pointer"
                      data-testid={`checkbox-${id}`}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary whitespace-nowrap">{bonus}</span>
                </label>
              ))}
            </div>
          )}

          {/* Step 4 — Script upload */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
              <div className="border-2 border-dashed border-input rounded-sm p-10 text-center bg-secondary/30">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <div className="text-sm font-semibold mb-2">Upload Script or Pitch Deck</div>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
                  Your script is encrypted and reviewed only for eligibility.
                </p>
                <input
                  type="file" accept=".pdf,.docx,.txt"
                  className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) form.setValue('scriptFilename', e.target.files[0].name);
                  }}
                  data-testid="input-script-upload"
                />
              </div>
              {form.watch('scriptFilename') && (
                <p className="text-xs text-muted-foreground text-center">
                  Selected: <span className="font-medium text-foreground">{form.watch('scriptFilename')}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                You may also proceed without uploading — this step is optional.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-40"
              data-testid="btn-back"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex h-10 items-center justify-center border border-foreground/20 px-6 text-sm font-medium transition-all hover:bg-foreground hover:text-white"
                data-testid="btn-next"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center border border-foreground/20 px-6 text-sm font-medium transition-all hover:bg-foreground hover:text-white disabled:opacity-40"
                data-testid="btn-submit-eligibility"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Review
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
