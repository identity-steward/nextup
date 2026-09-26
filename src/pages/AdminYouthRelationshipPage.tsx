import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AthleteService, type IdentityReviewPerson } from '../services/athleteService';
import { PersonService } from '../services/personService';
import type { YouthGovernanceStatus, YouthStatusSource, RelationshipType, RelationshipSource, PersonRelationship } from '../types/person';
import {
  Shield, Users, Search, AlertTriangle, CheckCircle2, XCircle,
  ArrowLeft, UserPlus, Baby, User, Plus,
} from 'lucide-react';

type View = 'list' | 'person-detail' | 'add-relationship';

export function AdminYouthRelationshipPage() {
  const { user } = useAuth();
  const [persons, setPersons] = useState<IdentityReviewPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedPerson, setSelectedPerson] = useState<IdentityReviewPerson | null>(null);
  const [relationships, setRelationships] = useState<PersonRelationship[]>([]);
  const [allPersons, setAllPersons] = useState<IdentityReviewPerson[]>([]);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Add-relationship form state
  const [relSubjectId, setRelSubjectId] = useState('');
  const [relRelatedId, setRelRelatedId] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('parent');
  const [relSource, setRelSource] = useState<RelationshipSource>('admin_recorded');

  const load = useCallback(async () => {
    setLoading(true);
    const personData = await AthleteService.getPersonsForSelection();
    setPersons(personData);
    setAllPersons(personData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = persons.filter((p) => {
    if (!search.trim()) return true;
    return `${p.first_name} ${p.last_name || ''}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectPerson = async (person: IdentityReviewPerson) => {
    setSelectedPerson(person);
    setView('person-detail');
    const rels = await PersonService.getRelationshipsForPerson(person.id);
    setRelationships(rels);
  };

  const handleSetYouthStatus = async (status: YouthGovernanceStatus) => {
    if (!selectedPerson || !user) return;
    setActing(true);
    setActionError('');
    const source: YouthStatusSource = 'admin_recorded';
    const ok = await PersonService.setYouthStatus(selectedPerson.id, status, user.id, source);
    setActing(false);
    if (ok) {
      await load();
      const updated = await AthleteService.getPersonsForSelection();
      const found = updated.find((p) => p.id === selectedPerson.id);
      if (found) setSelectedPerson(found);
    } else {
      setActionError('Failed to update youth status.');
    }
  };

  const handleCreateRelationship = async () => {
    if (!relSubjectId || !relRelatedId || !user) return;
    if (relSubjectId === relRelatedId) { setActionError('Subject and related person must be different.'); return; }
    setActing(true);
    setActionError('');
    const created = await PersonService.createRelationship(relSubjectId, relRelatedId, relType, relSource, user.id);
    setActing(false);
    if (created) {
      setRelSubjectId('');
      setRelRelatedId('');
      setRelType('parent');
      setRelSource('admin_recorded');
      if (selectedPerson) {
        const rels = await PersonService.getRelationshipsForPerson(selectedPerson.id);
        setRelationships(rels);
      }
    } else {
      setActionError('Failed to create relationship. A duplicate active relationship may already exist.');
    }
  };

  const handleEndRelationship = async (relId: string) => {
    if (!confirm('End this relationship? This will mark it as ended.')) return;
    setActing(true);
    const ok = await PersonService.endRelationship(relId);
    setActing(false);
    if (ok && selectedPerson) {
      const rels = await PersonService.getRelationshipsForPerson(selectedPerson.id);
      setRelationships(rels);
    }
  };

  const handleBackToList = () => {
    setSelectedPerson(null);
    setRelationships([]);
    setView('list');
    setActionError('');
  };

  const youthStatusBadge = (status: string) => {
    if (status === 'youth') return <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full"><Baby className="w-3 h-3" /> Youth</span>;
    if (status === 'adult') return <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><User className="w-3 h-3" /> Adult</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Unknown</span>;
  };

  // ============================================================
  // PERSON DETAIL VIEW
  // ============================================================
  if (view === 'person-detail' && selectedPerson) {
    return (
      <DashboardLayout title="Youth & Relationship Review">
        <div className="max-w-3xl mx-auto">
          <button onClick={handleBackToList} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>

          {/* Person header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedPerson.first_name} {selectedPerson.last_name || ''}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {youthStatusBadge(selectedPerson.youth_governance_status)}
                  {selectedPerson.auth_user_id && <span className="text-xs text-gray-400">Has account</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Youth governance section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Youth-Governance Classification</h3>
            <p className="text-xs text-gray-500 mb-4">Record whether this person should be treated under youth-specific governance. This is a product classification, not a legal age verification.</p>
            <div className="flex gap-2">
              <button onClick={() => handleSetYouthStatus('youth')} disabled={acting || selectedPerson.youth_governance_status === 'youth'}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-50 {selectedPerson.youth_governance_status === 'youth' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}">
                <Baby className="w-4 h-4 mx-auto mb-1" /> Youth
              </button>
              <button onClick={() => handleSetYouthStatus('adult')} disabled={acting || selectedPerson.youth_governance_status === 'adult'}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-50 {selectedPerson.youth_governance_status === 'adult' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 text-gray-600'}">
                <User className="w-4 h-4 mx-auto mb-1" /> Adult
              </button>
              <button onClick={() => handleSetYouthStatus('unknown')} disabled={acting || selectedPerson.youth_governance_status === 'unknown'}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-50 {selectedPerson.youth_governance_status === 'unknown' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300 text-gray-600'}">
                <AlertTriangle className="w-4 h-4 mx-auto mb-1" /> Unknown
              </button>
            </div>
            {actionError && <p className="text-sm text-red-600 mt-3">{actionError}</p>}
          </div>

          {/* Relationships section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Relationships</h3>
              <button onClick={() => setView('add-relationship')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white text-xs font-bold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Relationship
              </button>
            </div>
            {relationships.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No relationships recorded.</p>
            ) : (
              <div className="space-y-2">
                {relationships.map((rel) => {
                  const isSubject = rel.subject_person_id === selectedPerson.id;
                  const otherPersonId = isSubject ? rel.related_person_id : rel.subject_person_id;
                  const otherPerson = allPersons.find((p) => p.id === otherPersonId);
                  return (
                    <div key={rel.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${rel.status === 'active' ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {isSubject ? '← ' : '→ '}{rel.relationship_type} of{' '}
                          {otherPerson ? `${otherPerson.first_name} ${otherPerson.last_name || ''}` : 'Unknown person'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {rel.status === 'active' ? 'Active' : rel.status === 'ended' ? 'Ended' : 'Disputed'}
                          {` · ${rel.source.replace(/_/g, ' ')}`}
                        </p>
                      </div>
                      {rel.status === 'active' && (
                        <button onClick={() => handleEndRelationship(rel.id)} disabled={acting}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-semibold transition-colors">
                          End
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consent readiness */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Authority/Consent not yet established.</strong> Youth classification and relationship recording do not create AuthorityToAct, ConsentGrant, or YouthAssent records. Those require separate future steps.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // ADD RELATIONSHIP VIEW
  // ============================================================
  if (view === 'add-relationship' && selectedPerson) {
    return (
      <DashboardLayout title="Add Relationship">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => { setView('person-detail'); setActionError(''); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to {selectedPerson.first_name}
          </button>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Record a Person Relationship</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject (the person being related to)</label>
                <select value={relSubjectId} onChange={(e) => setRelSubjectId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm">
                  <option value="">Select subject person...</option>
                  {allPersons.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name || ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Related (the person who has the relationship)</label>
                <select value={relRelatedId} onChange={(e) => setRelRelatedId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm">
                  <option value="">Select related person...</option>
                  {allPersons.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name || ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Relationship Type</label>
                <select value={relType} onChange={(e) => setRelType(e.target.value as RelationshipType)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm">
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Source</label>
                <select value={relSource} onChange={(e) => setRelSource(e.target.value as RelationshipSource)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm">
                  <option value="admin_recorded">Admin recorded</option>
                  <option value="self_declared">Self declared</option>
                  <option value="subject_confirmed">Subject confirmed</option>
                  <option value="related_person_confirmed">Related person confirmed</option>
                  <option value="external_record">External record</option>
                </select>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs text-gray-500">Recording a relationship does not create authority, consent, or assent. It only records that NextUp has been told this relationship exists, based on the stated source.</p>
              </div>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
              <button onClick={handleCreateRelationship} disabled={acting || !relSubjectId || !relRelatedId}
                className="w-full bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                {acting ? 'Creating...' : 'Record Relationship'}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // LIST VIEW
  // ============================================================
  return (
    <DashboardLayout title="Youth & Relationship Review">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Baby className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{persons.filter((p) => p.youth_governance_status === 'youth').length}</p><p className="text-xs text-gray-500 font-medium">Youth</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-green-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{persons.filter((p) => p.youth_governance_status === 'adult').length}</p><p className="text-xs text-gray-500 font-medium">Adult</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{persons.filter((p) => p.youth_governance_status === 'unknown').length}</p><p className="text-xs text-gray-500 font-medium">Unknown</p></div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800"><strong>Youth & Relationship Review:</strong> Record youth-governance classification and person-to-person relationships. These do not create authority, consent, or assent — those are separate future steps.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search persons..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center"><p className="text-gray-400 text-sm">No persons found.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((person) => (
              <button key={person.id} onClick={() => handleSelectPerson(person)} className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-left hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{person.first_name} {person.last_name || ''}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {youthStatusBadge(person.youth_governance_status)}
                      {person.auth_user_id && <span className="text-xs text-gray-400">Has account</span>}
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
