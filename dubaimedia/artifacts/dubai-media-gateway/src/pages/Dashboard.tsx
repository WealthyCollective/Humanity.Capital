import { useEffect } from 'react';
import { useGetDashboard, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/contexts/SessionContext';
import { Loader2, AlertCircle, Clock, CheckCircle2, ChevronRight, LayoutDashboard, Plus } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function Dashboard() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard({
    query: { enabled: !!user, queryKey: getGetDashboardQueryKey() }
  });

  useEffect(() => {
    if (!isSessionLoading && !user) {
      setLocation('/');
    }
  }, [user, isSessionLoading, setLocation]);

  if (isSessionLoading || (!user && !isSessionLoading)) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'under review':
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'under review':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-secondary text-foreground border-border';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">My Dashboard</h1>
          <div className="h-px w-16 bg-primary"></div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/eligibility" className="inline-flex h-9 items-center justify-center border border-foreground/20 px-4 text-sm font-medium transition-all hover:bg-foreground hover:text-white">
            <Plus className="h-4 w-4 mr-1" /> New Application
          </Link>
        </div>
      </div>

      {isDashboardLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : dashboard?.items.length ? (
        <div className="bg-white border border-card-border rounded-sm shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {dashboard.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.detail && <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:ml-auto pl-8 sm:pl-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-sm border uppercase tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <Link
                    href={item.type === 'FEEDBACK' ? '/feedback' : '/eligibility'}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`View ${item.title}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center text-center p-12 bg-white">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Welcome to the Gateway</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You don't have any active applications or projects yet. Start by checking your rebate eligibility or getting feedback on a pitch.
          </p>
          <div className="flex gap-4">
            <Link href="/eligibility" className="inline-flex h-10 items-center justify-center border border-foreground/20 px-4 text-sm font-medium transition-all hover:bg-foreground hover:text-white">
              Check Eligibility
            </Link>
            <Link href="/feedback" className="inline-flex h-10 items-center justify-center border border-primary px-4 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-white">
              Pitch Feedback
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
