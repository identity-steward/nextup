import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  AthleteService,
  type IdentityReviewAthlete,
  type IdentityReviewPerson,
} from '../services/athleteService';
import {
  UserCheck, Search, Plus, AlertTriangle, CheckCircle2, XCircle,
  ArrowLeft, Shield,
} from 'lucide-react';

type ReviewState = 'list' | 'select-person' | 'create-person' | 'confirm';

export function AdminIdentityReviewPage() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<IdentityReviewAthlete[]>([]);
  const [persons, setPersons] = useState<IdentityReviewPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<IdentityReviewAthlete | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<IdentityReviewPerson | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>('list');
  const [personSearch, setPersonSearch] = useState('');
  const [newPersonFirst, setNewPersonFirst] = useState('');
  const [newPersonLast, setNewPersonLast] = useState('');
  const [actionError, setActionError] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [athleteData, personData] = await Promise.all([
      AthleteService.getAthletesForIdentityReview(),
      AthleteService.getPersonsForSelection(),
    ]);
    setAthletes(athleteData);
    setPersons(personData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = athletes.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${a.first_name} ${a.last_initial} ${a.sport} ${a.school || ''} ${a.city || ''}`.toLowerCase().includes(q);
  });

  const getPriority = (a: IdentityReviewAthlete): 'HIGH' | 'NORMAL' => {
    if (a.person_id) return 'NORMAL';
    if (a.profile_status === 'active') return 'HIGH';
    return 'NORMAL';
  };

  const handleStartReview = (athlete: IdentityReviewAthlete) => {
    setSelectedAthlete(athlete);
    setSelectedPerson(null);
    setReviewState('select-person');
    setPersonSearch('');
    setNewPersonFirst('');
    setNewPersonLast('');
    setActionError('');
  };

  const handleSelectPerson = (person: IdentityReviewPerson) => {
    setSelectedPerson(person);
    setReviewState('confirm');
    setActionError('');
  };

  const handleCreatePerson = async () => {
    if (!newPersonFirst.trim()) { setActionError('First name is required.'); return; }
    setActing(true);
    setActionError('');
    const created = await AthleteService.createPersonForIdentity(newPersonFirst.trim(), newPersonLast.trim() || undefined);
    setActing(false);
    if (created) { setSelectedPerson(created); setReviewState('confirm'); }
    else { setActionError('Failed to create person.'); }
  };

  const handleConfirmIdentity = async () => {
    if (!selectedAthlete || !selectedPerson || !user) return;
    setActing(true);
    setActionError('');
    const ok = await AthleteService.confirmAthletePersonIdentity(selectedAthlete.id, selectedPerson.id, user.id);
    setActing(false);
    if (ok) { await load(); handleBackToList(); }
    else { setActionError('Failed to confirm identity.'); }
  };

  const handleClearIdentity = async (athlete: IdentityReviewAthlete) => {
    if (!confirm('Clear identity link? This resets to unresolved.')) return;
    setActing(true);
    const ok = await AthleteService.clearAthletePersonIdentity(athlete.id);
    setActing(false);
    if (ok) await load();
  };

  const handleBackToList = () => {
    setSelectedAthlete(null);
    setSelectedPerson(null);
    setReviewState('list');
    setActionError('');
  };

  const filteredPersons = persons.filter((p) => {
    if (!personSearch.trim()) return true;
    return `${p.first_name} ${p.last_name || ''}`.toLowerCase().includes(personSearch.toLowerCase());
  });

  const confirmedCount = athletes.filter((a) => a.person_id).length;
  const unresolvedCount = athletes.filter((a) => !a.person_id).length;

  if (reviewState === 'confirm' && selectedAthlete && selectedPerson) {
    return (
      <DashboardLayout title="Identity Review">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleBackToList} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Confirm Identity</h2>
                <p className="text-sm text-gray-500">Explicitly confirm the athlete-to-person association</p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Athlete</p>
                <p className="text-base font-bold text-gray-900">{selectedAthlete.first_name} {selectedAthlete.last_initial}.</p>
                <p className="text-sm text-gray-500">{selectedAthlete.sport} · {selectedAthlete.slug}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Person</p>
                <p className="text-base font-bold text-gray-900">{selectedPerson.first_name} {selectedPerson.last_name || ''}</p>
                <p className="text-sm text-gray-500">{selectedPerson.youth_governance_status === 'youth' ? 'Youth' : selectedPerson.youth_governance_status === 'adult' ? 'Adult' : 'Youth status: unknown'}</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium">Confirm that this Athlete profile represents this Person. This means the Person is the human subject depicted and described by this profile.</p>
            </div>
            {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={handleConfirmIdentity} disabled={acting} className="flex-1 bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                {acting ? 'Confirming...' : 'Confirm Identity'}
              </button>
              <button onClick={handleBackToList} disabled={acting} className="px-6 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3.5 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if ((reviewState === 'select-person' || reviewState === 'create-person') && selectedAthlete) {
    return (
      <DashboardLayout title="Identity Review">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleBackToList} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Who does this Athlete record represent?</h2>
            <p className="text-sm text-gray-500 mb-6">{selectedAthlete.first_name} {selectedAthlete.last_initial}. · {selectedAthlete.sport} · {selectedAthlete.slug}</p>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              <button onClick={() => setReviewState('select-person')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${reviewState === 'select-person' ? 'bg-white text-[#1a1f3a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Select Existing Person</button>
              <button onClick={() => setReviewState('create-person')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${reviewState === 'create-person' ? 'bg-white text-[#1a1f3a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Create New Person</button>
            </div>
            {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}
            {reviewState === 'select-person' && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search persons..." value={personSearch} onChange={(e) => setPersonSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredPersons.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No persons found.</p> :
                    filteredPersons.map((p) => (
                      <button key={p.id} onClick={() => handleSelectPerson(p)} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-left">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.first_name} {p.last_name || ''}</p>
                          <p className="text-xs text-gray-400">{p.youth_governance_status === 'youth' ? 'Youth' : p.youth_governance_status === 'adult' ? 'Adult' : 'Youth status: unknown'}{p.auth_user_id ? ' · Has account' : ' · No account'}</p>
                        </div>
                        <UserCheck className="w-4 h-4 text-gray-300" />
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
            {reviewState === 'create-person' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                  <input type="text" value={newPersonFirst} onChange={(e) => setNewPersonFirst(e.target.value)} placeholder="Enter the person's first name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name (optional)</label>
                  <input type="text" value={newPersonLast} onChange={(e) => setNewPersonLast(e.target.value)} placeholder="Enter the person's last name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-500">The admin must explicitly enter the person's name. Youth status is not set during identity linking.</p>
                </div>
                <button onClick={handleCreatePerson} disabled={acting || !newPersonFirst.trim()} className="w-full flex items-center justify-center gap-2 bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                  <Plus className="w-4 h-4" />{acting ? 'Creating...' : 'Create Person'}
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Identity Review">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><UserCheck className="w-5 h-5 text-gray-400" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{confirmedCount}</p><p className="text-xs text-gray-500 font-medium">Confirmed</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{unresolvedCount}</p><p className="text-xs text-gray-500 font-medium">Unresolved</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{athletes.length}</p><p className="text-xs text-gray-500 font-medium">Total Athletes</p></div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search athletes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm" />
          </div>
          <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 transition-colors"><Shield className="w-4 h-4" /></button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800"><strong>Identity Review:</strong> Each athlete must be explicitly linked to a confirmed Person. No automatic matching. Identity confirmation does not authorize media publication.</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center"><p className="text-gray-400 text-sm">No athletes found.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((athlete) => {
              const isConfirmed = !!athlete.person_id;
              const priority = getPriority(athlete);
              return (
                <div key={athlete.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{athlete.first_name} {athlete.last_initial}.</h3>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{athlete.sport}</span>
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Unresolved</span>
                        )}
                        {!isConfirmed && priority === 'HIGH' && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">HIGH PRIORITY</span>}
                      </div>
                      <p className="text-xs text-gray-400">{athlete.school ? `${athlete.school} · ` : ''}{athlete.city || ''}{athlete.class_year ? ` · Class of ${athlete.class_year}` : ''}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        {athlete.auth_user_id ? <span className="inline-flex items-center gap-1"><UserCheck className="w-3 h-3" /> Has account</span> : <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> No account</span>}
                      </div>
                      {isConfirmed && athlete.identity_confirmed_at && <p className="text-xs text-gray-400 mt-1.5">Confirmed {new Date(athlete.identity_confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{athlete.identity_confirmation_method ? ` · ${athlete.identity_confirmation_method.replace(/_/g, ' ')}` : ''}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isConfirmed ? (
                        <button onClick={() => handleClearIdentity(athlete)} disabled={acting} className="px-4 py-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors">Clear Link</button>
                      ) : (
                        <button onClick={() => handleStartReview(athlete)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-bold text-sm transition-colors"><UserCheck className="w-4 h-4" /> Review Identity</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
