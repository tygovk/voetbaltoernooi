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
  Flame,
  Radio,
} from 'lucide-react';
import {
  Match,
  Team,
  TournamentData,
  UserRole,
  GoalEvent,
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
  calculateTopscorers,
} from './utils/standings';
import { Header } from './components/Header';
import { NextMatchHighlight } from './components/NextMatchHighlight';
import { GroupStandingsTable } from './components/GroupStandingsTable';
import { GroupMatches } from './components/GroupMatches';
import { KnockoutBracket } from './components/KnockoutBracket';
import { TournamentRankings } from './components/TournamentRankings';
import { TopscorersRanking } from './components/TopscorersRanking';
import { TeamsOverview } from './components/TeamsOverview';
import { TeamManagerModal } from './components/TeamManagerModal';
import { ScoreModal } from './components/ScoreModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangePinModal } from './components/ChangePinModal';
import { ResetTournamentModal } from './components/ResetTournamentModal';
import { AdminActionBar } from './components/AdminActionBar';
import { ToastNotification, ToastData } from './components/ToastNotification';
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
const UNDO_STORAGE_KEY = 'voetbaltoernooi_undo_v1';

interface UndoItem {
  tournament: TournamentData;
  description: string;
}

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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedMatchForScoreModal, setSelectedMatchForScoreModal] = useState<Match | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastData | null>(null);

  // Undo history stack
  const [undoStack, setUndoStack] = useState<UndoItem[]>(() => {
    try {
      const saved = localStorage.getItem(UNDO_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  // Sound Effects State
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overzicht' | 'groepen' | 'knockout' | 'rangschikking' | 'topscorers' | 'teams'
  >('overzicht');

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

  // Persist Undo Stack
  useEffect(() => {
    try {
      localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(undoStack));
    } catch {}
  }, [undoStack]);

  // Push current state to undo stack
  const pushToUndoStack = (description: string) => {
    setUndoStack((prev) => [
      ...prev.slice(-9), // Keep maximum 10 steps
      { tournament: JSON.parse(JSON.stringify(tournament)), description },
    ]);
  };

  // Realtime Cloud Firestore Synchronization across all devices
  useEffect(() => {
    testConnection();

    const unsubscribe = subscribeToTournament(
      (remoteData) => {
        // When any device pushes an update, instantly apply it across all screens
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

  // Helper to update state and push to Firestore
  const updateAndSyncTournament = (updater: (prev: TournamentData) => TournamentData) => {
    setTournament((prev) => {
      const next = updater(prev);
      pushTournamentToFirestore(next, setCloudSyncStatus);
      return next;
    });
  };

  // Undo Last Result
  const handleUndoLastResult = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    const newStack = undoStack.slice(0, -1);
    setUndoStack(newStack);

    setTournament(last.tournament);
    pushTournamentToFirestore(last.tournament, setCloudSyncStatus);
    sounds.playWhistle();

    setToast({
      id: `toast-${Date.now()}`,
      message: `Hersteld: ${last.description}`,
      type: 'info',
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

  // Compute final tournament rankings in real-time
  const finalRankings = useMemo(
    () => calculateTournamentFinalRankings(tournament.teams, tournament.matches),
    [tournament.teams, tournament.matches]
  );

  // Compute topscorers in real-time from all matches
  const topscorers = useMemo(() => {
    return calculateTopscorers(tournament.matches, tournament.teams);
  }, [tournament.matches, tournament.teams]);

  // Check if any match is currently live
  const liveMatch = useMemo(() => {
    return tournament.matches.find((m) => m.status === 'live') || null;
  }, [tournament.matches]);

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
    awayPenalties: number | null = null,
    goals?: GoalEvent[]
  ) => {
    // Only push to undo stack if finishing a match or resetting it, not on every live stepper tap
    if (status === 'finished') {
      const matchObj = tournament.matches.find((m) => m.id === matchId);
      const label = matchObj ? matchObj.label : 'Wedstrijd';
      pushToUndoStack(`Uitslag ingevoerd: ${label} (${homeScore}-${awayScore})`);
    }

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
          goals: goals !== undefined ? goals : m.goals,
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

    if (status === 'finished') {
      setToast({
        id: `toast-${Date.now()}`,
        message: 'Uitslag en doelpunten succesvol opgeslagen en gesynchroniseerd!',
        type: 'success',
        undoAction: handleUndoLastResult,
        undoLabel: 'Herstel',
      });
    }
  };

  // Handle Teams Update
  const handleSaveTeams = (updatedTeams: Team[]) => {
    pushToUndoStack('Teams en spelers bijgewerkt');
    updateAndSyncTournament((prev) => {
      const synced = synchronizeKnockoutMatches(prev.matches, updatedTeams);
      return {
        ...prev,
        teams: updatedTeams,
        matches: synced,
        updatedAt: Date.now(),
      };
    });
    setToast({
      id: `toast-${Date.now()}`,
      message: 'Teams en spelers zijn bijgewerkt!',
      type: 'success',
    });
  };

  // Reset Scores Only ("Toernooi op 0 zetten")
  const handleResetScores = () => {
    pushToUndoStack('Toernooi op 0 gezet (alle uitslagen gewist)');

    updateAndSyncTournament((prev) => {
      const resetMatches = prev.matches.map((m) => ({
        ...m,
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'scheduled' as const,
        goals: [],
      }));
      const synced = synchronizeKnockoutMatches(resetMatches, prev.teams);
      return {
        ...prev,
        matches: synced,
        updatedAt: Date.now(),
      };
    });

    setHighlightMatchIndex(0);
    sounds.playWhistle();

    setToast({
      id: `toast-${Date.now()}`,
      message: 'Toernooi op 0 gezet. Alle uitslagen en doelpunten zijn gewist.',
      type: 'info',
      undoAction: handleUndoLastResult,
      undoLabel: 'Ongedaan maken',
    });
  };

  // Full Factory Reset
  const handleResetAll = () => {
    pushToUndoStack('Volledige fabrieksreset uitgevoerd');
    const fresh = getDefaultTournament();
    const synced = synchronizeKnockoutMatches(fresh.matches, fresh.teams);
    updateAndSyncTournament(() => ({ ...fresh, matches: synced }));
    setHighlightMatchIndex(0);
    setToast({
      id: `toast-${Date.now()}`,
      message: 'Toernooi hersteld naar standaard fabrieksinstellingen.',
      type: 'warning',
      undoAction: handleUndoLastResult,
      undoLabel: 'Herstel',
    });
  };

  // Load Sample Tournament Results
  const handleLoadSampleData = () => {
    pushToUndoStack('Voorbeelddata geladen');
    const sample = getSampleTournamentWithResults();
    const synced = synchronizeKnockoutMatches(sample.matches, sample.teams);
    updateAndSyncTournament(() => ({ ...sample, matches: synced }));
    setToast({
      id: `toast-${Date.now()}`,
      message: 'Voorbeelddata met uitslagen geladen.',
      type: 'info',
      undoAction: handleUndoLastResult,
      undoLabel: 'Herstel',
    });
  };

  // Simulate Knockout Progression
  const handleSimulateKnockouts = () => {
    pushToUndoStack('Knock-out fase gesimuleerd');
    const sample = getSampleTournamentWithResults();
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

    let synced = synchronizeKnockoutMatches(currentMatches, tournament.teams);

    synced = synced.map((m) => {
      if (m.id === 'match-semi-1') {
        return { ...m, homeScore: 3, awayScore: 1, status: 'finished' as const };
      }
      if (m.id === 'match-semi-2') {
        return { ...m, homeScore: 1, awayScore: 2, status: 'finished' as const };
      }
      return m;
    });

    synced = synchronizeKnockoutMatches(synced, tournament.teams);

    synced = synced.map((m) => {
      if (m.id === 'match-third') {
        return { ...m, homeScore: 3, awayScore: 2, status: 'finished' as const };
      }
      if (m.id === 'match-final') {
        return { ...m, homeScore: 4, awayScore: 2, status: 'finished' as const };
      }
      return m;
    });

    synced = synchronizeKnockoutMatches(synced, tournament.teams);

    sounds.playGoal();
    updateAndSyncTournament((prev) => ({
      ...prev,
      matches: synced,
      updatedAt: Date.now(),
    }));

    setToast({
      id: `toast-${Date.now()}`,
      message: 'Halve finales, troostfinale en finale gesimuleerd!',
      type: 'success',
      undoAction: handleUndoLastResult,
      undoLabel: 'Herstel',
    });
  };

  const currentHighlightMatch = tournament.matches[highlightMatchIndex] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans">
      
      {/* 1. Header Bar */}
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
        cloudSyncStatus={cloudSyncStatus}
        canUndo={undoStack.length > 0}
        undoCount={undoStack.length}
        lastUndoDescription={undoStack[undoStack.length - 1]?.description}
        onUndoLastResult={handleUndoLastResult}
        onOpenResetScoresModal={() => setIsResetModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Admin Action Bar (Only when Admin is logged in) */}
        {role === 'admin' && (
          <AdminActionBar
            canUndo={undoStack.length > 0}
            undoCount={undoStack.length}
            lastUndoDescription={undoStack[undoStack.length - 1]?.description}
            onUndoLastResult={handleUndoLastResult}
            onOpenResetScoresModal={() => setIsResetModalOpen(true)}
            onOpenTeamManager={() => setIsTeamManagerOpen(true)}
            onOpenChangePin={() => setIsChangePinOpen(true)}
            onAdminLogout={handleAdminLogout}
            completedMatches={completedMatches}
            totalMatches={tournament.matches.length}
          />
        )}

        {/* Global Live Match Banner if any match is currently marked Live */}
        {liveMatch && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border border-rose-500/50 shadow-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <span className="font-black text-rose-300 uppercase tracking-wider mr-2">
                  ● LIVE OP VELD {liveMatch.pitch.replace(/\D/g, '') || '1'}
                </span>
                <span className="text-white font-bold">
                  {tournament.teams.find((t) => t.id === liveMatch.homeTeamId)?.name || 'Thuis'}{' '}
                  <span className="font-mono text-rose-400 bg-black/40 px-1.5 py-0.5 rounded mx-1">
                    {liveMatch.homeScore ?? 0} - {liveMatch.awayScore ?? 0}
                  </span>{' '}
                  {tournament.teams.find((t) => t.id === liveMatch.awayTeamId)?.name || 'Uit'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const idx = tournament.matches.findIndex((m) => m.id === liveMatch.id);
                if (idx !== -1) setHighlightMatchIndex(idx);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition active:scale-95 shrink-0"
            >
              Bekijk Live Stand
            </button>
          </div>
        )}

        {/* 2. Navigation Tabs & Mode Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
          
          {/* Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="tab-overzicht"
              type="button"
              onClick={() => {
                setActiveTab('overzicht');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overzicht'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overzicht</span>
            </button>

            <button
              id="tab-groepen"
              type="button"
              onClick={() => {
                setActiveTab('groepen');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'groepen'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Poules & Wedstrijden</span>
            </button>

            <button
              id="tab-knockout"
              type="button"
              onClick={() => {
                setActiveTab('knockout');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'knockout'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Knock-outfase</span>
            </button>

            <button
              id="tab-rangschikking"
              type="button"
              onClick={() => {
                setActiveTab('rangschikking');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'rangschikking'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Medal className="w-4 h-4" />
              <span>Eindstand</span>
            </button>

            {/* Topscorers Tab ⚽ */}
            <button
              id="tab-topscorers"
              type="button"
              onClick={() => {
                setActiveTab('topscorers');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'topscorers'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Topscorers</span>
              {topscorers.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-amber-300 font-mono">
                  {topscorers.length}
                </span>
              )}
            </button>

            <button
              id="tab-teams"
              type="button"
              onClick={() => {
                setActiveTab('teams');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'teams'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </button>
          </nav>

          {/* Role Status Tag */}
          <div className="flex items-center gap-2 text-xs">
            {role === 'admin' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Beheerder</span>
                </span>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
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

        {/* 3. "Volgende Wedstrijd" / "Live Wedstrijd" Highlight Banner */}
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

            {/* Quick Topscorers Preview on Overview page */}
            {topscorers.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Topscorer van het toernooi: {topscorers[0].playerName}
                      <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                        {topscorers[0].goals} doelpunten
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Team: {topscorers[0].teamName} • {topscorers.length} spelers op de topscorerslijst
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('topscorers')}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition"
                >
                  Bekijk Volledige Ranking →
                </button>
              </div>
            )}
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

        {activeTab === 'topscorers' && (
          <div className="animate-in fade-in duration-200">
            <TopscorersRanking
              topscorers={topscorers}
              teams={tournament.teams}
              role={role}
              onNavigateToMatches={() => setActiveTab('groepen')}
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
              Voetbaltoernooi 3v3 • Real-time live scores, doelpunten & standen
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cloud Sync: {cloudSyncStatus}</span>
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
              onClick={() => setIsResetModalOpen(true)}
              className="text-slate-400 hover:text-rose-400 transition"
            >
              Toernooi op 0
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

      {/* Reset Tournament Modal */}
      <ResetTournamentModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetScores={handleResetScores}
        onResetAll={handleResetAll}
        completedMatchesCount={completedMatches}
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

      {/* Global Toast Notification */}
      <ToastNotification
        toast={toast}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
