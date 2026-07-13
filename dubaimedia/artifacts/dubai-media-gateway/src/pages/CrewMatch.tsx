import { useState } from 'react';
import { useMatchCrew, useRequestCrewTeam, CrewMatchResult } from '@workspace/api-client-react';
import { Loader2, Users, Calendar, Check, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CrewMatch() {
  const [result, setResult] = useState<CrewMatchResult | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();
  
  const { mutate: matchCrew, isPending: isMatching } = useMatchCrew();
  const { mutate: requestTeam } = useRequestCrewTeam();

  const handleMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deps = formData.getAll('department') as string[];
    
    if (deps.length === 0) {
      toast({ title: 'Select at least one department', variant: 'destructive' });
      return;
    }

    matchCrew({
      data: {
        projectType: formData.get('projectType') as string,
        shootWindow: formData.get('shootWindow') as string,
        departments: deps
      }
    }, {
      onSuccess: (data) => setResult(data)
    });
  };

  const handleRequest = () => {
    if (!result) return;
    setIsRequesting(true);
    requestTeam({
      data: {
        projectType: result.projectType,
        shootWindow: result.shootWindow,
        departments: result.team.map(t => t.department)
      }
    }, {
      onSuccess: () => {
        toast({ title: 'Team requested successfully', description: 'Our liaison will confirm availability within 24 hours.' });
        setIsRequesting(false);
      },
      onError: () => setIsRequesting(false)
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Team Matching Engine</h1>
        <div className="h-px w-16 bg-primary mb-4"></div>
        <p className="text-muted-foreground">Auto-assemble a verified local crew for your production based on your dates and requirements.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm sticky top-24">
            <h2 className="font-semibold mb-4">Requirements</h2>
            <form onSubmit={handleMatch} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Project Type</label>
                <select name="projectType" className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Feature Film</option>
                  <option>Commercial</option>
                  <option>TV Series</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Shoot Window</label>
                <input required name="shootWindow" placeholder="e.g. Oct 15 - Nov 5" className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold mb-2 block">Required Departments</label>
                {['Directing', 'Camera', 'Sound', 'VFX', 'Post', 'Production', 'Art'].map(dep => (
                  <label key={dep} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input type="checkbox" name="department" value={dep} className="rounded-sm border-primary text-primary focus:ring-primary h-4 w-4" />
                    <span>{dep}</span>
                  </label>
                ))}
              </div>

              <button type="submit" disabled={isMatching} className="w-full h-10 mt-4 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center justify-center shadow-sm">
                {isMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                Generate Match
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-8">
          {result ? (
            <div className="space-y-6">
              <div className="bg-secondary px-6 py-4 rounded-sm border border-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Proposed Team</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1.5" /> {result.shootWindow}
                  </p>
                </div>
                <button 
                  onClick={handleRequest}
                  disabled={isRequesting}
                  className="h-10 px-6 rounded-sm bg-foreground text-background text-sm font-medium hover:bg-foreground/90 flex items-center shadow-sm transition-colors"
                >
                  {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Request This Team
                </button>
              </div>

              <div className="space-y-4">
                {result.team.map((member, i) => (
                  <div key={i} className="bg-white border border-card-border p-5 rounded-sm shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-sm bg-secondary flex items-center justify-center text-primary font-bold shrink-0">
                      {member.department.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{member.department}</div>
                      {member.isPlaceholder ? (
                        <div className="font-medium text-foreground">{member.placeholderLabel}</div>
                      ) : (
                        <div className="font-medium text-lg flex items-center gap-2">
                          {member.profile?.name} 
                          {member.profile?.isVerified && <Check className="h-4 w-4 text-green-600" />}
                        </div>
                      )}
                    </div>
                    
                    {!member.isPlaceholder && member.profile && (
                      <div className="text-right">
                        <div className="text-sm font-medium">{member.profile.yearsExperience} yrs exp</div>
                        {member.profile.isEmirati && (
                          <div className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Emirati</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center text-center p-8 bg-white/50">
              <div className="h-16 w-16 bg-secondary text-primary rounded-sm flex items-center justify-center mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Assemble your ideal team</h3>
              <p className="text-muted-foreground max-w-sm">
                Select your parameters on the left, and our engine will instantly match you with verified, available local talent meeting the Gateway rebate requirements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
