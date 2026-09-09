import React, { useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Eye,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Users,
  Settings,
  Calendar,
  MapPin,
  HelpCircle,
  Lock,
  LogOut,
  KeyRound,
  Cloud,
  CloudOff,
  RefreshCw,
  Undo2,
} from 'lucide-react';
import { UserRole } from '../types';
import { sounds } from '../utils/audio';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenTeamManager: () => void;
  onResetScores: () => void;
  onResetAll: () => void;
  onLoadSampleData: () => void;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenChangePin: () => void;
  tournamentName: string;
  location: string;
  date: string;
  totalMatches: number;
  completedMatches: number;
  cloudSyncStatus?: 'synced' | 'saving' | 'offline' | 'connecting';
  canUndo?: boolean;
  undoCount?: number;
  lastUndoDescription?: string;
  onUndoLastResult?: () => void;
  onOpenResetScoresModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  soundEnabled,
  setSoundEnabled,
  onOpenTeamManager,
  onResetScores,
  onResetAll,
  onLoadSampleData,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenChangePin,
  tournamentName,
  location,
  date,
  totalMatches,
  completedMatches,
  cloudSyncStatus = 'synced',
  canUndo = false,
  undoCount = 0,
  lastUndoDescription,
  onUndoLastResult,
  onOpenResetScoresModal,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playWhistle();
  };

  const progressPercent =
    totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return (
    <header id="main-header" className="border-b border-emerald-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Tournament Details */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {tournamentName}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  8 Teams • 3v3
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {date}
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {location}
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="text-emerald-400 font-medium">
                  {completedMatches}/{totalMatches} gespeeld ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar: Protected Role Switch & Controls */}
          <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
            
            {/* Real-time Cloud Sync Badge */}
            <div
              id="cloud-sync-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs shadow-inner"
              title={
                cloudSyncStatus === 'synced'
                  ? 'Realtime verbonden: Uitslagen en standen worden live bijgewerkt op elk apparaat'
                  : cloudSyncStatus === 'saving'
                  ? 'Bezig met opslaan naar alle apparaten...'
                  : 'Verbinding maken met toernooiserver...'
              }
            >
              {cloudSyncStatus === 'synced' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium text-emerald-300 hidden sm:inline">
                    Live gesynchroniseerd
                  </span>
                </>
              )}
              {cloudSyncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="text-[11px] font-medium text-amber-300">Synchroniseren...</span>
                </>
              )}
              {cloudSyncStatus === 'connecting' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-[11px] font-medium text-slate-400">Verbinden...</span>
                </>
              )}
              {cloudSyncStatus === 'offline' && (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] font-medium text-rose-300">Offline</span>
                </>
              )}
            </div>

            {/* Protected Role Switcher */}
            {role === 'spectator' ? (
              <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 shadow-inner items-center">
                <div
                  id="status-spectator-active"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-sm"
                  title="Toeschouwer modus (Alleen-lezen)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Toeschouwer</span>
                </div>

                <button
                  id="btn-open-admin-login"
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 transition-all ml-0.5"
                  title="Inloggen als Beheerder met code"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Beheerder</span>
                </button>
              </div>
            ) : (
              /* When Authenticated as Admin */
              <div className="inline-flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-bold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Beheerder</span>
                </div>

                <button
                  id="btn-admin-logout"
                  type="button"
                  onClick={onAdminLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-800 transition"
                  title="Beheerder sessie beëindigen en terugkeren naar toeschouwer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Uitloggen</span>
                </button>
              </div>
            )}

            {/* Admin Action Quick Buttons in Header */}
            {role === 'admin' && (
              <>
                {/* Undo Last Result Button */}
                <button
                  id="btn-header-undo"
                  type="button"
                  onClick={onUndoLastResult}
                  disabled={!canUndo}
                  title={
                    canUndo
                      ? `Laatste uitslag terugdraaien: ${lastUndoDescription || 'Vorige actie'}`
                      : 'Geen uitslagen om terug te draaien'
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    canUndo
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 cursor-pointer active:scale-95 shadow-sm'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Uitslag</span> Terugdraaien
                  {canUndo && undoCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                      {undoCount}
                    </span>
                  )}
                </button>

                {/* Reset Tournament to 0 Button */}
                <button
                  id="btn-header-reset-scores"
                  type="button"
                  onClick={() => onOpenResetScoresModal?.()}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/60 transition active:scale-95 cursor-pointer shadow-sm"
                  title="Alle uitslagen wissen en toernooi op 0 zetten"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Toernooi</span> op 0
                </button>

                {/* Admin-only: Teams Beheren Button */}
                <button
                  id="btn-manage-teams"
                  type="button"
                  onClick={onOpenTeamManager}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Teams en 3 spelers bewerken"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Teams</span> Instellen
                </button>
              </>
            )}

            {/* Audio Toggle */}
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs transition ${
                soundEnabled
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={soundEnabled ? 'Geluidseffecten uitschakelen' : 'Geluidseffecten inschakelen'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Help / Uitleg */}
            <button
              id="btn-toggle-help"
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Spelregels & Uitleg"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Admin Management Menu */}
            {role === 'admin' && (
              <div className="relative">
                <button
                  id="btn-admin-menu"
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Opties & Beveiliging"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    id="admin-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Beheerdersinstellingen
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenChangePin();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Beheerderscode wijzigen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadSampleData();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Voorbeelddata invullen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenResetScoresModal?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>Toernooi op 0 zetten (scores wissen)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenResetScoresModal?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>Volledige fabrieksreset</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal/Banner for Rules & Help */}
        {showHelp && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm text-emerald-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Toernooiformat & Beveiliging
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>
                <strong>Toeschouwersmodus:</strong> Toeschouwers kunnen realtime alle uitslagen, poulestanden en de knock-outboom volgen zonder bewerkrechten.
              </li>
              <li>
                <strong>Beheerdersmodus:</strong> Beschermd met een geheime beheerderscode. Alleen na inloggen kunnen uitslagen worden ingevuld of teams worden aangepast.
              </li>
              <li>
                <strong>Poule-indeling:</strong> 8 teams van 3 personen, verdeeld over Groep A en Groep B (4 teams per poule).
              </li>
              <li>
                <strong>Rangorde Poulefase:</strong> 1. Punten (3 winst, 1 gelijk, 0 verlies), 2. Doelsaldo, 3. Doelpunten voor, 4. Onderling resultaat.
              </li>
              <li>
                <strong>Knock-outfase:</strong> Halve finales (A1 vs B2, B1 vs A2). De winnaars gaan naar de Finale 🏆, de verliezers spelen de Troostfinale 🥉 om de 3e en 4e plaats.
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};
