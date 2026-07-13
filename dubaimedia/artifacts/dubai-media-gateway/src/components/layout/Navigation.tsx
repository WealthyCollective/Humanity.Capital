import React from 'react';
import { Link, useLocation } from 'wouter';
import { useSession } from '@/contexts/SessionContext';
import { useCreateSession, useDeleteSession } from '@workspace/api-client-react';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Navigation() {
  const { user, refetch } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();
  const { mutate: login } = useCreateSession();
  const { mutate: logout } = useDeleteSession();
  const { toast } = useToast();

  // On the landing page the nav sits on top of the hero — use transparent bg
  const isHome = location === '/';

  const [personaOpen, setPersonaOpen] = React.useState(false);

  const DEMO_PERSONAS = [
    { email: 'rd@humanitycapital.us',       name: 'Rummana Dada', role: 'Admin — Humanity Capital' },
    { email: 'hesham@dubaimediacouncil.ae', name: 'Hesham',        role: 'Dubai Media Council' },
  ];

  const handleLoginAs = (email: string, name: string) => {
    login(
      { data: { email, name } },
      {
        onSuccess: () => {
          toast({ title: `Signed in as ${name}` });
          refetch();
        },
      }
    );
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({ title: 'Signed out' });
        refetch();
      },
    });
  };

  const navLinks = [
    { label: 'Eligibility', path: '/eligibility' },
    { label: 'Feedback',    path: '/feedback'    },
    { label: 'Talent',      path: '/talent'      },
    { label: 'Venues',      path: '/venues'      },
    { label: 'Hub',         path: '/hub'         },
    { label: 'Festival',    path: '/festival'    },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-white transition-colors"
    >
      <div className="container mx-auto flex h-[60px] items-center justify-between px-6 md:px-10">

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-home">
          <div
            className="h-5 w-5 bg-primary flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-foreground group-hover:text-primary transition-colors">
            Dubai Media Gateway
          </span>
        </Link>

        {/* Desktop nav — all-caps small tracking */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground/80 hover:text-primary transition-colors"
              data-testid={`link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground border border-border px-2 py-0.5">
                {user.tier}
              </span>
              <Link
                href="/dashboard"
                className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground/80 hover:text-primary transition-colors"
                data-testid="link-dashboard"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground/80 hover:text-primary transition-colors"
                data-testid="button-logout"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/membership"
                className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground/80 hover:text-primary transition-colors"
                data-testid="link-membership"
              >
                Membership
              </Link>
              <div className="relative">
                <button
                  onClick={() => setPersonaOpen(o => !o)}
                  className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground border border-foreground/30 px-3 py-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  data-testid="button-login"
                >
                  Sign in
                </button>
                {personaOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border shadow-md w-64 z-50">
                    {DEMO_PERSONAS.map(p => (
                      <button
                        key={p.email}
                        onClick={() => { handleLoginAs(p.email, p.name); setPersonaOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                      >
                        <p className="text-[11px] font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.role}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-1.5 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-6 space-y-5">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground">{user.email}</span>
                <Link
                  href="/dashboard"
                  className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="text-left text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-primary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/membership"
                  className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Membership
                </Link>
                <div className="space-y-1">
                  <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-muted-foreground/50 mb-2">Sign in as</p>
                  {DEMO_PERSONAS.map(p => (
                    <button
                      key={p.email}
                      onClick={() => { handleLoginAs(p.email, p.name); setIsOpen(false); }}
                      className="w-full text-left py-2 px-3 border border-border text-[11px] hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{p.role}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
