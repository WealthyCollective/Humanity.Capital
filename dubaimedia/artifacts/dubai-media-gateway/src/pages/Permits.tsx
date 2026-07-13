import { useState } from 'react';
import { FileText, Download, ChevronDown, CheckCircle2 } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';

export default function Permits() {
  const [answers, setAnswers] = useState({
    location: '',
    drone: '',
    road: '',
    minors: ''
  });
  const [showResult, setShowResult] = useState(false);

  const generateChecklist = () => {
    setShowResult(true);
  };

  const handleDownload = () => {
    const text = `DUBAI MEDIA GATEWAY - PERMIT CHECKLIST
Generated: ${new Date().toLocaleDateString()}

LOCATION: ${answers.location}
${answers.location === 'outdoor public space' ? '- DFTC Public Space Permit Required (Allow 5-7 working days)' : ''}
${answers.location === 'private property' ? '- Private Location NOC Required\n- DFTC General Filming Permit Required (Allow 3-5 working days)' : ''}
${answers.location === 'road' ? '- RTA Road Closure Permit Required (Allow 14 working days)\n- Dubai Police Escort Booking Required' : ''}
${answers.location === 'indoor studio' ? '- Studio facility NOC (No external permit required)' : ''}

SPECIAL REQUIREMENTS:
${answers.drone === 'yes' ? '- DCAA Drone Permit Required (Allow 10-14 working days)\n- Licensed Drone Operator Certificate Required' : '- No drone permits required.'}
${answers.minors === 'yes' ? '- Ministry of Labour Minor Work Permit (Allow 5 working days)\n- Guardian Consent Forms' : '- No minor permits required.'}

Standard Content Guideline Review: Mandatory for all scripts.
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dubai_Filming_Permits.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold mb-4">Permits & Guidelines</h1>
        <p className="text-lg text-muted-foreground">Generate a custom checklist of required legal permits for your shoot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="bg-white border border-card-border p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Permit Wizard</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold">1. Primary Location Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['indoor studio', 'outdoor public space', 'private property', 'road'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setAnswers(s => ({ ...s, location: type }))}
                      className={`px-3 py-2 text-sm text-left border rounded-sm transition-colors ${answers.location === type ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input bg-background hover:bg-secondary'}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">2. Will you use drones?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map(val => (
                    <button key={val} onClick={() => setAnswers(s => ({ ...s, drone: val }))} className={`flex-1 py-2 text-sm border rounded-sm transition-colors ${answers.drone === val ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input bg-background hover:bg-secondary'}`}>
                      {val.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">3. Does cast include minors?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map(val => (
                    <button key={val} onClick={() => setAnswers(s => ({ ...s, minors: val }))} className={`flex-1 py-2 text-sm border rounded-sm transition-colors ${answers.minors === val ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input bg-background hover:bg-secondary'}`}>
                      {val.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={generateChecklist}
                disabled={!answers.location || !answers.drone || !answers.minors}
                className="w-full h-11 rounded-sm bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50 mt-4"
              >
                Generate Checklist
              </button>
            </div>
          </div>
        </div>

        <div>
          {showResult ? (
            <div className="bg-secondary p-6 rounded-sm border border-border h-full flex flex-col animate-in fade-in zoom-in-95">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Required Permits</h3>
              
              <ul className="space-y-4 flex-1 text-sm">
                {answers.location === 'outdoor public space' && (
                  <li className="bg-white p-3 rounded-sm border border-border">
                    <div className="font-semibold text-foreground">DFTC Public Space Permit</div>
                    <div className="text-muted-foreground text-xs mt-1">Authority: Dubai Film & TV Commission<br/>Timeline: 5-7 working days</div>
                  </li>
                )}
                {answers.location === 'private property' && (
                  <li className="bg-white p-3 rounded-sm border border-border">
                    <div className="font-semibold text-foreground">DFTC General Filming Permit + Location NOC</div>
                    <div className="text-muted-foreground text-xs mt-1">Authority: DFTC & Property Owner<br/>Timeline: 3-5 working days</div>
                  </li>
                )}
                {answers.location === 'road' && (
                  <li className="bg-white p-3 rounded-sm border border-border">
                    <div className="font-semibold text-foreground">RTA Road Closure & Police Escort</div>
                    <div className="text-muted-foreground text-xs mt-1">Authority: RTA & Dubai Police<br/>Timeline: 14 working days</div>
                  </li>
                )}
                {answers.drone === 'yes' && (
                  <li className="bg-white p-3 rounded-sm border border-border border-l-4 border-l-amber-500">
                    <div className="font-semibold text-foreground">DCAA Drone Permit</div>
                    <div className="text-muted-foreground text-xs mt-1">Authority: Civil Aviation Authority<br/>Timeline: 10-14 working days</div>
                  </li>
                )}
                {answers.minors === 'yes' && (
                  <li className="bg-white p-3 rounded-sm border border-border">
                    <div className="font-semibold text-foreground">Minor Work Permit</div>
                    <div className="text-muted-foreground text-xs mt-1">Authority: Ministry of Labour<br/>Timeline: 5 working days</div>
                  </li>
                )}
              </ul>

              <button onClick={handleDownload} className="w-full h-10 mt-6 rounded-sm border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                <Download className="mr-2 h-4 w-4" /> Download Text Copy
              </button>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center text-center p-8 bg-secondary/30">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm max-w-[200px]">Complete the wizard to generate your custom legal checklist.</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">General Guidelines</h2>
        <Accordion.Root type="single" collapsible className="w-full bg-white border border-card-border rounded-sm shadow-sm">
          <Accordion.Item value="content" className="border-b border-border last:border-0">
            <Accordion.Header className="flex">
              <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 px-6 font-medium transition-all hover:bg-secondary/50 [&[data-state=open]>svg]:rotate-180">
                Content Guidelines
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
                All scripts and concepts must be submitted for review prior to issuing any permits. Content must respect local cultural norms and laws. Explicit adult content, defamation of political figures, or content threatening national security will be rejected.
              </div>
            </Accordion.Content>
          </Accordion.Item>
          
          <Accordion.Item value="visas" className="border-b border-border last:border-0">
            <Accordion.Header className="flex">
              <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 px-6 font-medium transition-all hover:bg-secondary/50 [&[data-state=open]>svg]:rotate-180">
                Crew Visas
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
                International crew require specific short-term working visas. The Gateway provides fast-track visa processing for approved productions. Allow 5-7 working days for processing once passports are submitted.
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="customs" className="border-b border-border last:border-0">
            <Accordion.Header className="flex">
              <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 px-6 font-medium transition-all hover:bg-secondary/50 [&[data-state=open]>svg]:rotate-180">
                Customs & Equipment
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
                Temporary import of film equipment requires an ATA Carnet. If your country does not issue ATA Carnets, a temporary import bond must be posted at Dubai Customs. The Gateway logistics team can facilitate this process.
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  );
}
