import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { SessionProvider } from '@/contexts/SessionContext';
import { Layout } from '@/components/layout/Layout';

// Pages
import Landing from '@/pages/Landing';
import Eligibility from '@/pages/Eligibility';
import Feedback from '@/pages/Feedback';
import Membership from '@/pages/Membership';
import Talent from '@/pages/Talent';
import CrewMatch from '@/pages/CrewMatch';
import Venues from '@/pages/Venues';
import Hub from '@/pages/Hub';
import Investors from '@/pages/Investors';
import Permits from '@/pages/Permits';
import Festival from '@/pages/Festival';
import Dashboard from '@/pages/Dashboard';
import PartnerKpis from '@/pages/PartnerKpis';
import AdminDashboard from '@/pages/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/eligibility" component={Eligibility} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/membership" component={Membership} />
        <Route path="/talent" component={Talent} />
        <Route path="/crew-match" component={CrewMatch} />
        <Route path="/venues" component={Venues} />
        <Route path="/hub" component={Hub} />
        <Route path="/investors" component={Investors} />
        <Route path="/permits" component={Permits} />
        <Route path="/festival" component={Festival} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/partner" component={PartnerKpis} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <SessionProvider>
            <Router />
          </SessionProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
