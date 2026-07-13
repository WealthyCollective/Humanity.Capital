import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Check, X, ExternalLink, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const PAYMENT_LINKS = {
  creator: 'https://buy.stripe.com/8x2eVe2nOgpw9kXcH04gg0w',
  studio:  'https://buy.stripe.com/5kQbJ22nO0qy7cPcH04gg0x',
};

const TIER_PRICE: Record<string, string> = {
  free:    'AED 0',
  creator: 'AED 199',
  studio:  'AED 999',
};

export default function Membership() {
  const { user, refetch } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  // Detect return from Stripe payment link (configure success URL in Stripe Dashboard
  // to include ?subscribed=1 so we auto-sync the user's subscription).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscribed') === '1') {
      setJustPaid(true);
      // Auto-sync after a short delay (gives Stripe webhook time to fire first)
      setTimeout(() => handleSync(true), 1500);
    }
  }, []);

  const handleSync = async (silent = false) => {
    setSyncing(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Sync failed');
      await refetch();
      if (!silent) {
        toast({ title: 'Subscription synced', description: 'Your membership tier is up to date.' });
      }
    } catch {
      if (!silent) toast({ title: 'Sync failed', description: 'Please try again in a moment.' });
    } finally {
      setSyncing(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/portal`, { credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? 'Portal unavailable');
      }
    } catch (err: any) {
      toast({ title: 'Could not open portal', description: err.message });
    } finally {
      setPortalLoading(false);
    }
  };

  /** Build the payment link URL with prefilled user details for a smoother checkout. */
  const paymentUrl = (tier: 'creator' | 'studio') => {
    const base = PAYMENT_LINKS[tier];
    const params = new URLSearchParams();
    if (user?.id)    params.set('client_reference_id', user.id);
    if (user?.email) params.set('prefilled_email', user.email);
    return `${base}?${params.toString()}`;
  };

  const tiers = [
    {
      key: 'free' as const,
      name: 'Free',
      price: 'AED 0',
      period: 'forever',
      features: [
        'Eligibility checker access',
        '1 pitch analysis per month',
        'Browse national talent registry',
        <span key="x1" className="text-muted-foreground line-through">Crew matching engine</span>,
        <span key="x2" className="text-muted-foreground line-through">Hub bookings</span>,
        <span key="x3" className="text-muted-foreground line-through">Investor matching</span>,
      ],
    },
    {
      key: 'creator' as const,
      name: 'Creator',
      price: 'AED 199',
      period: '/ month',
      features: [
        'Eligibility checker access',
        'Unlimited pitch analyses',
        'Browse national talent registry',
        'Crew matching engine',
        'Hub bookings',
        'Festival priority review',
        '1 hot desk pass / month',
        <span key="x4" className="text-muted-foreground line-through">Investor matching</span>,
      ],
    },
    {
      key: 'studio' as const,
      name: 'Studio',
      price: 'AED 999',
      period: '/ month',
      features: [
        'Everything in Creator',
        'Investor matching access',
        'Dedicated government liaison',
        'Subsidy administration support',
        'Custom venue negotiation',
        'API access to registry',
        '5 hot desk passes / month',
        'Events access — screenings, mixers & industry talks',
      ],
    },
  ];

  const currentTier = user?.tier ?? 'free';

  return (
    <div className="container mx-auto px-4 py-16">

      {/* Post-payment banner */}
      {justPaid && (
        <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4 bg-primary/5 border border-primary/20 px-6 py-4">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Payment received — activating your membership…</p>
            <p className="text-xs text-muted-foreground mt-0.5">This usually takes a few seconds. If your tier hasn't updated, click Sync below.</p>
          </div>
          {syncing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-semibold mb-4">Membership Tiers</h1>
        <p className="text-lg text-muted-foreground">
          Join the gateway to unlock full production tools, matching engines, and priority access to Dubai infrastructure.
        </p>

        {/* Current plan indicator for signed-in users */}
        {user && (
          <div className="mt-6 inline-flex items-center gap-3 border border-border px-5 py-2.5">
            <span className="text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground">Current plan</span>
            <span className="text-sm font-semibold capitalize">{currentTier}</span>
            <span className="text-xs text-muted-foreground">{TIER_PRICE[currentTier]}</span>

            {currentTier !== 'free' && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={() => handleSync()}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                  title="Sync subscription status from Stripe"
                >
                  {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Sync
                </button>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                >
                  {portalLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                  Manage
                </button>
              </>
            )}

            {currentTier === 'free' && user && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={() => handleSync()}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                  title="Already paid? Click to sync your subscription"
                >
                  {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Already paid? Sync
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-border max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const isCurrentTier = currentTier === tier.key;
          const isUpgrade = tier.key !== 'free' && (
            currentTier === 'free' ||
            (currentTier === 'creator' && tier.key === 'studio')
          );

          return (
            <div
              key={tier.name}
              className="group relative flex flex-col bg-white p-8 transition-all duration-300"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#5B9AC4')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            >
              {tier.name === 'Creator' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary group-hover:bg-white text-white group-hover:text-primary text-[9px] font-bold uppercase tracking-widest py-1 px-3 transition-colors duration-300">
                  Most Popular
                </div>
              )}

              {/* Active badge */}
              {isCurrentTier && tier.key !== 'free' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest py-0.5 px-2 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Active
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors duration-300">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold group-hover:text-white transition-colors duration-300">{tier.price}</span>
                  <span className="text-muted-foreground text-sm font-medium group-hover:text-white/60 transition-colors duration-300">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {typeof feature === 'string' ? (
                      <Check className="h-5 w-5 text-primary group-hover:text-white/80 shrink-0 transition-colors duration-300" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground group-hover:text-white/40 shrink-0 transition-colors duration-300" />
                    )}
                    <span className="group-hover:text-white/85 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.key === 'free' ? (
                <button
                  disabled
                  className="w-full h-11 border border-input bg-secondary text-muted-foreground font-medium text-sm group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white/60 transition-all duration-300"
                >
                  {isCurrentTier ? 'Current Plan' : 'Free Access'}
                </button>
              ) : isCurrentTier ? (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="w-full h-11 border border-foreground/20 text-foreground text-[11px] font-medium tracking-[0.12em] uppercase transition-all duration-300 group-hover:border-white group-hover:text-white hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Manage Subscription
                </button>
              ) : !user ? (
                <a
                  href={PAYMENT_LINKS[tier.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 border border-foreground/20 text-foreground text-[11px] font-medium tracking-[0.12em] uppercase transition-all duration-300 group-hover:border-white group-hover:text-white hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  Join {tier.name}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <a
                  href={paymentUrl(tier.key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 border border-foreground/20 text-foreground text-[11px] font-medium tracking-[0.12em] uppercase transition-all duration-300 group-hover:border-white group-hover:text-white hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  {isUpgrade && currentTier !== 'free' ? 'Upgrade to' : 'Join'} {tier.name}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-payment instructions */}
      <div className="max-w-6xl mx-auto mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Payment is processed securely by Stripe. After completing checkout, your membership tier activates automatically via webhook.{' '}
          {user
            ? 'Use the Sync button above if your plan hasn\'t updated within a minute.'
            : 'Sign in first to link your payment to your account.'
          }
        </p>
      </div>

    </div>
  );
}
