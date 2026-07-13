import { useGetPartnerKpis } from '@workspace/api-client-react';
import { Loader2, TrendingUp, Users, Video, MapPin, Ticket } from 'lucide-react';

export default function PartnerKpis() {
  const { data: kpis, isLoading } = useGetPartnerKpis();

  const formatAed = (val: number) => {
    return new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: 'AED',
      notation: "compact", 
      compactDisplay: "short" 
    }).format(val);
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!kpis) return null;

  const maxRebate = Math.max(...kpis.monthly.map(m => m.rebatesCommittedAed));

  return (
    <div className="flex-1 w-full bg-secondary pb-20">
      <div className="bg-white border-b border-border pt-12 pb-8 mb-12 shadow-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dubai Films and Games Commission</h1>
          <p className="text-muted-foreground mt-2">Partner reporting view (demo data).</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <div className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Applications
            </div>
            <div className="text-3xl font-semibold">{kpis.totals.applications}</div>
          </div>
          
          <div className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex flex-col border-l-4 border-l-primary">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Est. Rebates
            </div>
            <div className="text-2xl lg:text-3xl font-semibold text-primary">{formatAed(kpis.totals.rebatesCommittedAed)}</div>
          </div>

          <div className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Emirati Talent
            </div>
            <div className="text-3xl font-semibold">{kpis.totals.emiratiRegistered}</div>
          </div>

          <div className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Venues Booked
            </div>
            <div className="text-3xl font-semibold">{kpis.totals.productionsMatched}</div>
          </div>

          <div className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Ticket className="h-4 w-4" /> Fest Entries
            </div>
            <div className="text-3xl font-semibold">{kpis.totals.festivalSubmissions}</div>
          </div>
        </div>

        <div className="bg-white border border-card-border rounded-sm shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-8 flex items-center justify-between">
            Monthly Estimated Rebate Commitments
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-sm border border-border">Trailing 6 Months</span>
          </h2>
          
          <div className="h-64 flex items-end gap-2 sm:gap-6 mt-8 relative pt-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pointer-events-none pb-8 z-10 w-16">
              <span>{formatAed(maxRebate)}</span>
              <span>{formatAed(maxRebate / 2)}</span>
              <span>AED 0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-16 right-0 top-0 border-b border-dashed border-border"></div>
            <div className="absolute left-16 right-0 top-1/2 border-b border-dashed border-border"></div>
            <div className="absolute left-16 right-0 bottom-8 border-b border-border"></div>

            {/* Bars */}
            <div className="flex items-end justify-between w-full pl-16 h-full pb-8">
              {kpis.monthly.map((month) => {
                const heightPercent = maxRebate > 0 ? (month.rebatesCommittedAed / maxRebate) * 100 : 0;
                return (
                  <div key={month.month} className="flex flex-col items-center flex-1 group">
                    <div className="w-full max-w-[4rem] relative h-full flex items-end">
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {formatAed(month.rebatesCommittedAed)}
                      </div>
                      
                      <div 
                        className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-sm" 
                        style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '4px' : '0' }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-wider">{month.month.substring(0, 3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
