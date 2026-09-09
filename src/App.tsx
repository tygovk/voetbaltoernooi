import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  LayoutGrid,
  Users,
  GitBranch,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Sparkles,
  Medal,
  Lock,
} from 'lucide-react';
import {
  Match,
  Team,
  TournamentData,
  UserRole,
} from './types';
import {
  getDefaultTournament,
  getSampleTournamentWithResults,
} from './data/defaultTournament';
import {
  calculateGroupStandings,
  getNextOrLiveMatch,
  synchronizeKnockoutMatches,
  calculateTournamentFinalRankings,
} from './utils/standings';
import { Header } from './components/Header';
import { NextMatchHighlight } from './components/NextMatchHighlight';
import { GroupStandingsTable } from './components/GroupStandingsTable';
import { GroupMatches } from './components/GroupMatches';
import { KnockoutBracket } from './components/KnockoutBracket';
import { TournamentRankings } from './components/TournamentRankings';
import { TeamsOverview } from './components/TeamsOverview';
import { TeamManagerModal } from './components/TeamManagerModal';
import { ScoreModal } from './components/ScoreModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangePinModal } from './components/ChangePinModal';
import { sounds } from './utils/audio';
import { testConnection } from './lib/firebase';
import {
  subscribeToTournament,
  pushTournamentToFirestore,
  SyncState,
} from './services/tournamentSync';

const STORAGE_KEY = 'voetbaltoernooi_data_v1';
const ROLE_STORAGE_KEY = 'voetbaltoernooi_role_v1';
const SOUND_STORAGE_KEY = 'voetbaltoernooi_sound_v1';
const ADMIN_PIN_KEY = 'voetbaltoernooi_admin_pin_v2';

export default function App() {
  // Realtime Cloud Sync State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<SyncState>('connecting');

  // 1. Tournament State with LocalStorage persistence
  const [tournament, setTournament] = useState<TournamentData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.teams && parsed.matches) {
          // Re-synchronize knockouts in case of stale cache
          const syncedMatches = synchronizeKnockoutMatches(parsed.matches, parsed.teams);
          return { ...parsed, matches: syncedMatches };
        }
      }
    } catch (e) {
      console.error('Error loading tournament from localStorage:', e);
    }
    const defaultData = getDefaultTournament();
    return {
      ...defaultData,
      matches: synchronizeKnockoutMatches(defaultData.matches, defaultData.teams),
    };
  });

  // 2. Role State: 'admin' | 'spectator' (Protected: default to 'spectator')
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === 'admin') {
        return 'admin';
      }
    } catch {
      // Ignore
    }
    return 'spectator';
  });

  // Admin PIN code for protected modifications (default 'kdtoernooi')
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PIN_KEY);
      if (saved) {
        return saved;
      }
      // If previous key was saved with old default '1234', migrate to 'kdtoernooi'
      const oldSaved = localStorage.getItem('voetbaltoernooi_admin_pin_v1');
      if (oldSaved && oldSaved !== '1234') {
        localStorage.setItem(ADMIN_PIN_KEY, oldSaved);
        return oldSaved;
      }
      localStorage.setItem(ADMIN_PIN_KEY, 'kdtoernooi');
      return 'kdtoernooi';
    } catch {
      return 'kdtoernooi';
    }
  });

  // Modals state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [selectedMatchForScoreModal, setSelectedMatchForScoreModal] = useState<Match | null>(null);

  // 3. Sound Effects State
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'overzicht' | 'groepen' | 'knockout' | 'rangschikking' | 'teams'>('overzicht');

  // Next match highlight selection index
  const [highlightMatchIndex, setHighlightMatchIndex] = useState<number>(0);

  // Persist Tournament Data to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
    } catch (e) {
      console.error('Error saving tournament to localStorage:', e);
    }
  }, [tournament]);

  // Realtime Cloud Firestore Synchronization across all devices
  useEffect(() => {
    testConnection();

    const unsubscribe = subscribeToTournament(
      (remoteData) => {
        // When any device pushes an update, instantly apply it
        setTournament(remoteData);
      },
      () => {
        // First-time cloud init: push current tournament to Firestore
        pushTournamentToFirestore(tournament, setCloudSyncStatus);
      },
      (status) => {
        setCloudSyncStatus(status);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper to update local state and broadcast to all devices via Firestore
  const updateAndSyncTournament = (updater: (prev: TournamentData) => TournamentData) => {
    setTournament((prev) => {
      const next = updater(prev);
      pushTournamentToFirestore(next, setCloudSyncStatus);
      return next;
    });
  };

  // Persist Role to LocalStorage
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {}
  };

  const handleAdminLoginSuccess = () => {
    setRole('admin');
  };

  const handleAdminLogout = () => {
    setRole('spectator');
    sounds.playClick();
  };

  const handleUpdatePin = (newPin: string) => {
    setAdminPin(newPin);
    try {
      localStorage.setItem(ADMIN_PIN_KEY, newPin);
    } catch (e) {
      console.error('Error saving admin pin:', e);
    }
  };

  // Persist Sound to LocalStorage
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.enabled = enabled;
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {}
  };

  // Determine Default Highlight Match
  useEffect(() => {
    const nextMatch = getNextOrLiveMatch(tournament.matches);
    if (nextMatch) {
      const idx = tournament.matches.findIndex((m) => m.id === nextMatch.id);
      if (idx !== -1) {
        setHighlightMatchIndex(idx);
      }
    }
  }, [tournament.matches]);

  // Compute standings in real-time
  const standingsA = useMemo(
    () => calculateGroupStandings(tournament.teams, tournament.matches, 'A'),
    [tournament.teams, tournament.matches]
  );

  const standingsB = useMemo(
    () => calculateGroupStandings(tournament.teams, tournament.matches, 'B'),
    [tournament.teams, tournament.matches]
  );

  // Compute final tournament rankings in real-time (including 3rd/4th from Troostfinale)
  const finalRankings = useMemo(
    () => calculateTournamentFinalRankings(tournament.teams, tournament.matches),
    [tournament.teams, tournament.matches]
  );

  // Completed matches count
  const completedMatches = tournament.matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  ).length;

  // Handle Score Update
  const handleUpdateScore = (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status: Match['status'] = 'finished',
    homePenalties: number | null = null,
    awayPenalties: number | null = null
  ) => {
    updateAndSyncTournament((prev) => {
      const updatedList = prev.matches.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          homeScore,
          awayScore,
          status,
          homePenalties: homePenalties !== undefined ? homePenalties : m.homePenalties,
          awayPenalties: awayPenalties !== undefined ? awayPenalties : m.awayPenalties,
        };
      });

      // Synchronize Knockouts
      const synced = synchronizeKnockoutMatches(updatedList, prev.teams);

      return {
        ...prev,
        matches: synced,
        updatedAt: Date.now(),
      };
    });
  };

  // Handle Teams Update
  const handleSaveTeams = (updatedTeams: Team[]) => {
    updateAndSyncTournament((prev) => {
      const synced = synchronizeKnockoutMatches(prev.matches, updatedTeams);
      return {
        ...prev,
        teams: updatedTeams,
        matches: synced,
        updatedAt: Date.now(),
      };
    });
  };

  // Reset Scores Only
  const handleResetScores = () => {
    updateAndSyncTournament((prev) => {
      const resetMatches = prev.matches.map((m) => ({
        ...m,
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'scheduled' as const,
      }));
      const synced = synchronizeKnockoutMatches(resetMatches, prev.teams);
      return {
        ...prev,
        matches: synced,
        updatedAt: Date.now(),
      };
    });
  };

  // Full Factory Reset
  const handleResetAll = () => {
    const fresh = getDefaultTournament();
    const synced = synchronizeKnockoutMatches(fresh.matches, fresh.teams);
    updateAndSyncTournament(() => ({ ...fresh, matches: synced }));
    setHighlightMatchIndex(0);
  };

  // Load Sample Tournament Results
  const handleLoadSampleData = () => {
    const sample = getSampleTournamentWithResults();
    const synced = synchronizeKnockoutMatches(sample.matches, sample.teams);
    updateAndSyncTournament(() => ({ ...sample, matches: synced }));
  };

  // Simulate Knockout Progression (Halve Finales -> Troostfinale & Finale)
  const handleSimulateKnockouts = () => {
    const sample = getSampleTournamentWithResults();
    // Fill group stage if unplayed
    let currentMatches = tournament.matches.map((m) => {
      if (m.stage === 'group' && (m.homeScore === null || m.awayScore === null)) {
        const sampleM = sample.matches.find((s) => s.id === m.id);
        if (sampleM) {
          return {
            ...m,
            homeScore: sampleM.homeScore,
            awayScore: sampleM.awayScore,
            status: 'finished' as const,
          };
        }
      }
      return m;
    });

    // Synchronize Semifinals with group winners/runners-up
    let synced = synchronizeKnockoutMatches(currentMatches, tournament.teams);

    // Set sample scores for Semifinal 1 and Semifinal 2
    synced = synced.map((m) => {
      if (m.id === 'match-semi-1') {
        return { ...m, homeScore: 3, awayScore: 1, status: 'finished' as const };
      }
      if (m.id === 'match-semi-2') {
        return { ...m, homeScore: 1, awayScore: 2, status: 'finished' as const };
      }
      return m;
    });

    // Synchronize Grand Final & Troostfinale (Troostfinale now has both semifinal losers!)
    synced = synchronizeKnockoutMatches(synced, tournament.teams);

    // Also simulate a score for the Troostfinale so 3rd & 4th place are decided:
    synced = synced.map((m) => {
      if (m.id === 'match-third') {
        return { ...m, homeScore: 3, awayScore: 2, status: 'finished' as const };
      }
      if (m.id === 'match-final') {
        return { ...m, homeScore: 4, awayScore: 2, status: 'finished' as const };
      }
      return m;
    });

    // Resynchronize to ensure everything is consistent
    synced = synchronizeKnockoutMatches(synced, tournament.teams);

    sounds.playGoal();
    updateAndSyncTournament((prev) => ({
      ...prev,
      matches: synced,
      updatedAt: Date.now(),
    }));
  };

  const currentHighlightMatch = tournament.matches[highlightMatchIndex] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        role={role}
        setRole={setRole}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenTeamManager={() => setIsTeamManagerOpen(true)}
        onResetScores={handleResetScores}
        onResetAll={handleResetAll}
        onLoadSampleData={handleLoadSampleData}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenChangePin={() => setIsChangePinOpen(true)}
        tournamentName={tournament.name}
        location={tournament.location}
        date={tournament.date}
        totalMatches={tournament.matches.length}
        completedMatches={completedMatches}
        cloudSyncStatus={cloudSyncStatus === 'error' ? 'offline' : cloudSyncStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4 overflow-x-auto gap-2">
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs sm:text-sm font-semibold shrink-0">
            <button
              id="tab-overzicht"
              type="button"
              onClick={() => setActiveTab('overzicht')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition ${
                activeTab === 'overzicht'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overzicht</span>
            </button>

            <button
              id="tab-groepen"
              type="button"
              onClick={() => setActiveTab('groepen')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition ${
                activeTab === 'groepen'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Groepsfase & Standen</span>
            </button>

            <button
              id="tab-knockout"
              type="button"
              onClick={() => setActiveTab('knockout')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition ${
                activeTab === 'knockout'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Knock-outfase</span>
            </button>

            <button
              id="tab-rangschikking"
              type="button"
              onClick={() => setActiveTab('rangschikking')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition ${
                activeTab === 'rangschikking'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Medal className="w-4 h-4" />
              <span>Eindrangschikking</span>
            </button>

            <button
              id="tab-teams"
              type="button"
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition ${
                activeTab === 'teams'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams (8)</span>
            </button>
          </div>

          {/* Mode Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {role === 'admin' ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-600/40 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Beheerdersmodus: Wijzigingen actief</span>
                </span>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-rose-300 bg-slate-900 border border-slate-800 transition"
                >
                  Uitloggen
                </button>
              </div>
            ) : (
              <button
                id="btn-mode-indicator-login"
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-medium hover:border-amber-500/50 hover:text-amber-300 hover:bg-slate-850 transition cursor-pointer"
                title="Klik om in te loggen als beheerder"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Toeschouwersmodus • Inloggen als beheerder</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. "Volgende Wedstrijd" Highlight Banner - prominent at the top */}
        <NextMatchHighlight
          currentMatch={currentHighlightMatch}
          allMatches={tournament.matches}
          teams={tournament.teams}
          role={role}
          onUpdateScore={handleUpdateScore}
          onSelectMatchIndex={setHighlightMatchIndex}
          selectedMatchIndex={highlightMatchIndex}
        />

        {/* Tab Content Views */}
        {activeTab === 'overzicht' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Live Standings Preview */}
            <GroupStandingsTable
              standingsA={standingsA}
              standingsB={standingsB}
            />

            {/* Quick Match List */}
            <GroupMatches
              matches={tournament.matches}
              teams={tournament.teams}
              role={role}
              onUpdateScore={handleUpdateScore}
              onSelectMatch={(m) => {
                const idx = tournament.matches.findIndex((item) => item.id === m.id);
                if (idx !== -1) setHighlightMatchIndex(idx);
                if (role === 'admin') setSelectedMatchForScoreModal(m);
              }}
            />

            {/* Knockout Bracket Preview */}
            <KnockoutBracket
              matches={tournament.matches}
              teams={tournament.teams}
              role={role}
              onUpdateScore={handleUpdateScore}
              onSimulateKnockouts={handleSimulateKnockouts}
              onSelectMatch={(m) => {
                const idx = tournament.matches.findIndex((item) => item.id === m.id);
                if (idx !== -1) setHighlightMatchIndex(idx);
                if (role === 'admin') setSelectedMatchForScoreModal(m);
              }}
            />
          </div>
        )}

        {activeTab === 'groepen' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GroupStandingsTable
              standingsA={standingsA}
              standingsB={standingsB}
            />

            <GroupMatches
              matches={tournament.matches}
              teams={tournament.teams}
              role={role}
              onUpdateScore={handleUpdateScore}
              onSelectMatch={(m) => {
                const idx = tournament.matches.findIndex((item) => item.id === m.id);
                if (idx !== -1) setHighlightMatchIndex(idx);
                if (role === 'admin') setSelectedMatchForScoreModal(m);
              }}
            />
          </div>
        )}

        {activeTab === 'knockout' && (
          <div className="animate-in fade-in duration-200">
            <KnockoutBracket
              matches={tournament.matches}
              teams={tournament.teams}
              role={role}
              onUpdateScore={handleUpdateScore}
              onSimulateKnockouts={handleSimulateKnockouts}
              onSelectMatch={(m) => {
                const idx = tournament.matches.findIndex((item) => item.id === m.id);
                if (idx !== -1) setHighlightMatchIndex(idx);
                if (role === 'admin') setSelectedMatchForScoreModal(m);
              }}
            />
          </div>
        )}

        {activeTab === 'rangschikking' && (
          <div className="animate-in fade-in duration-200">
            <TournamentRankings
              rankings={finalRankings}
              role={role}
              onNavigateToKnockout={() => setActiveTab('knockout')}
            />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="animate-in fade-in duration-200">
            <TeamsOverview
              teams={tournament.teams}
              role={role}
              onOpenEdit={() => setIsTeamManagerOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400 font-medium">
              Voetbaltoernooi 3v3 • Automatische poule- & knock-out synchronisatie
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Data opgeslagen in LocalStorage</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-emerald-400 hover:underline"
            >
              Demo data laden
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleResetAll}
              className="text-slate-400 hover:text-rose-400 transition"
            >
              Fabrieksreset
            </button>
          </div>
        </div>
      </footer>

      {/* Team Manager Modal */}
      <TeamManagerModal
        isOpen={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        teams={tournament.teams}
        onSaveTeams={handleSaveTeams}
      />

      {/* Quick Score Modal */}
      <ScoreModal
        match={selectedMatchForScoreModal}
        isOpen={Boolean(selectedMatchForScoreModal)}
        onClose={() => setSelectedMatchForScoreModal(null)}
        teams={tournament.teams}
        onSave={handleUpdateScore}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        currentPin={adminPin}
      />

      {/* Change Admin PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        currentPin={adminPin}
        onUpdatePin={handleUpdatePin}
      />
    </div>
  );
}
