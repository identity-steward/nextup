import { FileText } from 'lucide-react';

interface CreateAthletePageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function CreateAthletePage(_props: CreateAthletePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <FileText className="w-4 h-4" />
            Athlete Intake
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your Athlete Page
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete the intake form below and we&apos;ll review the submission for your athlete page.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-2xl">
            <div className="overflow-hidden rounded-[22px] bg-slate-50">
              <iframe
                src="https://tally.so/embed/Ek0MxA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%"
                height="1100"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Create Your Athlete Page"
                className="block w-full"
                style={{ minHeight: '1100px' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
