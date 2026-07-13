import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'dmg_newsletter_dismissed';

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    // Demo: simulate network delay then show success
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Panel */}
      <div className="fixed z-[61] bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-10 md:top-1/2 md:-translate-y-1/2 md:w-[420px] animate-in slide-in-from-bottom md:slide-in-from-right duration-400">
        <div
          className="relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 120% 100% at 80% 40%, #C8E4F2 0%, #5B9AC4 35%, #2E6F9E 72%, #1C5480 100%)',
          }}
        >
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-8 md:p-10">
            {/* Label */}
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Dubai Films &amp; Games Commission
            </p>

            {!submitted ? (
              <>
                <h2 className="text-2xl md:text-3xl font-light text-white leading-snug mb-3">
                  Stay ahead of<br />Dubai's film scene.
                </h2>
                <p className="text-sm font-light leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Incentive updates, festival calls, production news and new crew listings — direct to your inbox. No noise.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full h-11 bg-white/10 border border-white/25 text-white placeholder:text-white/40 text-sm px-4 focus:outline-none focus:border-white/60 transition-colors"
                  />
                  {error && <p className="text-xs text-red-200">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-white text-primary text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center justify-center gap-2 transition-all hover:bg-white/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  No spam. Unsubscribe at any time.
                </p>
              </>
            ) : (
              <div className="py-6">
                <div className="text-4xl mb-5">✦</div>
                <h2 className="text-2xl font-light text-white mb-3">You're in.</h2>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  We'll keep you updated on incentives, festival calls, and what's filming in Dubai next.
                </p>
                <button
                  onClick={dismiss}
                  className="mt-8 text-[10px] font-medium tracking-[0.18em] uppercase border border-white/25 px-4 py-2 text-white/70 hover:text-white hover:border-white/50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
