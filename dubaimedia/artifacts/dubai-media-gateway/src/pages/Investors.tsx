import { useListInvestorProjects, getListInvestorProjectsQueryKey, useExpressInvestorInterest } from '@workspace/api-client-react';
import { useSession } from '@/contexts/SessionContext';
import { Loader2, Lock, TrendingUp, CheckCircle, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Investors() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { data: projects, isLoading: isProjectsLoading, refetch } = useListInvestorProjects({ 
    query: { enabled: user?.tier === 'studio', queryKey: getListInvestorProjectsQueryKey() } 
  });
  const { mutate: expressInterest } = useExpressInvestorInterest();
  const { toast } = useToast();

  const handleInterest = (id: string) => {
    expressInterest({ id }, {
      onSuccess: () => {
        toast({ title: 'Interest logged', description: 'The project owner will be notified.' });
        refetch();
      }
    });
  };

  const formatAed = (val: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', notation: "compact", compactDisplay: "short" }).format(val);

  if (isSessionLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || user.tier !== 'studio') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center flex-1 flex flex-col justify-center">
        <div className="bg-white border border-card-border p-10 rounded-sm shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/50"></div>
          <Lock className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-4 tracking-tight">Studio Tier Required</h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            The Investor Matchmaking portal is restricted to Studio Tier members. Access a curated slate of pre-qualified regional productions seeking capital, with matching government rebates already secured.
          </p>
          <div className="bg-secondary p-6 rounded-sm mb-8 text-left">
            <h3 className="font-semibold text-sm uppercase tracking-widest mb-4">Portal Benefits</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> View full pitch decks and budgets</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Direct introduction to showrunners</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Gateway rebate pre-approval status</li>
            </ul>
          </div>
          <Link href="/membership" className="inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Upgrade to Studio Tier
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
            Investor Matching <span className="bg-secondary text-primary text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-widest border border-border">Studio Access</span>
          </h1>
          <div className="h-px w-16 bg-primary mb-4"></div>
          <p className="text-muted-foreground">Curated slate of active productions seeking gap financing or co-production.</p>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-white px-4 py-2 border border-border rounded-sm shadow-sm inline-flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Active Dealflow
        </div>
      </div>

      {isProjectsLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects?.map(project => (
            <div key={project.id} className="bg-white border border-card-border p-6 rounded-sm shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{project.genre}</div>
                  <h3 className="text-xl font-semibold leading-tight">{project.title}</h3>
                </div>
                {project.rebatePrequalified && (
                  <div className="bg-primary/10 text-primary p-1.5 rounded-sm" title="Rebate Pre-qualified">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground/80 mb-6 flex-1 line-clamp-4">{project.synopsis}</p>

              <div className="grid grid-cols-2 gap-4 bg-secondary p-4 rounded-sm border border-border mb-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Budget</div>
                  <div className="font-semibold">{formatAed(project.budgetAed)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Seeking</div>
                  <div className="font-semibold text-primary">{formatAed(project.seekingAed)}</div>
                </div>
              </div>

              {project.interestExpressed ? (
                <div className="h-10 rounded-sm bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center justify-center">
                  <Handshake className="mr-2 h-4 w-4" /> Interest Logged
                </div>
              ) : (
                <button 
                  onClick={() => handleInterest(project.id)}
                  className="h-10 rounded-sm bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center w-full shadow-sm"
                >
                  Express Interest
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
