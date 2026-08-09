import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Compass, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import PathwayCard from '../components/pathway/PathwayCard';
import PathwayDetail from '../components/pathway/PathwayDetail';
import { getPersonForUser, getHouseholdForPerson, getNeeds } from '../services/narrationService';
import { getPathwaysForPerson, getContactAttempts } from '../services/pathwayService';
import type { Person, Need } from '../types/narration';
import type { PathwayWithRelations, ContactAttempt } from '../types/pathway';

export default function PathwaysPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [pathways, setPathways] = useState<PathwayWithRelations[]>([]);
  const [contactAttemptsMap, setContactAttemptsMap] = useState<Record<string, { attempts: ContactAttempt[] }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPathway, setSelectedPathway] = useState<PathwayWithRelations | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const p = await getPersonForUser(user.id);
      if (!p) {
        navigate('/start');
        return;
      }
      setPerson(p);
      const [, nds, pws] = await Promise.all([
        getHouseholdForPerson(p.id),
        getNeeds(p.id),
        getPathwaysForPerson(p.id),
      ]);
      setNeeds(nds);
      setPathways(pws);

      // Load contact attempts for all referrals
      const attemptsMap: Record<string, { attempts: ContactAttempt[] }> = {};
      for (const pw of pws) {
        if (pw.referrals) {
          for (const r of pw.referrals) {
            const attempts = await getContactAttempts(r.id);
            attemptsMap[r.id] = { attempts };
          }
        }
      }
      setContactAttemptsMap(attemptsMap);
    } catch (err) {
      console.error('Failed to load pathways:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void loadData(); }, [loadData, user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AppLayout>
    );
  }

  if (!person) return null;

  const confirmedNeeds = needs.filter((n) => n.status === 'confirmed');
  const activePathways = pathways.filter((p) => !['closed', 'completed'].includes(p.status));

  return (
    <AppLayout title="Pathways">
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Pathways</h1>
          <p className="text-gray-500 leading-relaxed">
            Here you can see what may help with each of your needs, who provides it,
            what it might cost, and what happens next.
          </p>
        </div>

        {/* Selected pathway detail */}
        {selectedPathway ? (
          <PathwayDetail
            pathway={selectedPathway}
            onBack={() => setSelectedPathway(null)}
            onShare={(pathwayId) => navigate('/app/share', { state: { pathwayId } })}
            contactAttempts={contactAttemptsMap}
          />
        ) : (
          <>
            {/* Active pathways */}
            {activePathways.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-navy">Your pathways</h2>
                {activePathways.map((pw) => (
                  <PathwayCard
                    key={pw.id}
                    pathway={pw}
                    onClick={() => setSelectedPathway(pw)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-bold text-navy mb-2">No pathways yet</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {confirmedNeeds.length > 0
                    ? 'Your navigator is reviewing your needs. Pathways will appear here once they identify what may help.'
                    : 'Tell us what\'s happening so we can identify what may help.'}
                </p>
                {confirmedNeeds.length === 0 && (
                  <button
                    onClick={() => navigate('/app/story')}
                    className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Tell your story
                  </button>
                )}
              </div>
            )}

            {/* Confirmed needs without pathways */}
            {confirmedNeeds.length > 0 && activePathways.length === 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-navy mb-3 text-sm">Your confirmed needs</h3>
                <div className="space-y-2">
                  {confirmedNeeds.map((need) => (
                    <div key={need.id} className="text-sm text-gray-600">
                      <span className="text-gray-400 mr-2">&bull;</span>
                      {need.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
