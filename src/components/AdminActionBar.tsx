import React from 'react';
import {
  Undo2,
  RotateCcw,
  Users,
  ShieldCheck,
  KeyRound,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { TournamentFormat } from '../types';

interface AdminActionBarProps {
  canUndo: boolean;
  undoCount: number;
  lastUndoDescription?: string;
  onUndoLastResult: () => void;
  onOpenResetScoresModal: () => void;
  onOpenTeamManager: () => void;
  onOpenChangePin: () => void;
  onAdminLogout: () => void;
  completedMatches: number;
  totalMatches: number;
  currentFormat: TournamentFormat;
  onSwitchFormat: (newFormat: TournamentFormat) => void;
}

export const AdminActionBar: React.FC<AdminActionBarProps> = ({
  canUndo,
  undoCount,
  lastUndoDescription,
  onUndoLastResult,
  onOpenResetScoresModal,
  onOpenTeamManager,
  onOpenChangePin,
  onAdminLogout,
  completedMatches,
  totalMatches,
  currentFormat,
  onSwitchFormat,
}) => {
  return (
    <div
      id="admin-action-bar"
      className="w-full bg-slate-900/90 backdrop-blur border border-amber-500/30 rounded-2xl p-3 mb-4 shadow-lg shadow-amber-950/20 animate-in fade-in duration-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Admin Status & Match Progress */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Beheerdersmodus</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span>Voortgang:</span>
            <span className="font-semibold text-white">
              {completedMatches}/{totalMatches}
            </span>
            <span>gespeeld</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">
              {currentFormat === '6_teams' ? '6 Teams (2x3)' : '8 Teams (2x4)'}
            </span>
          </div>
        </div>

        {/* Right: Quick Working Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* FORMAT SWITCH BUTTON */}
          <button
            id="btn-admin-switch-format"
            type="button"
            onClick={() => onSwitchFormat(currentFormat === '6_teams' ? '8_teams' : '6_teams')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              currentFormat === '6_teams'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-blue-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-950/40'
            }`}
            title={`Schakel tussen 6 teams (2 poules van 3) en 8 teams (2 poules van 4). Halve finales en finale blijven altijd actief.`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {currentFormat === '6_teams'
                ? 'Wissel naar 8 Teams (2 pools)'
                : 'Wissel naar 6 Teams (2 pools)'}
            </span>
          </button>

          {/* 1. UNDO LAST RESULT BUTTON */}
          <button
            id="btn-undo-last-result"
            type="button"
            onClick={onUndoLastResult}
            disabled={!canUndo}
            title={
              canUndo
                ? `Laatste uitslag terugdraaien: ${lastUndoDescription || 'Vorige actie'}`
                : 'Geen uitslagen om terug te draaien'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              canUndo
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 cursor-pointer active:scale-95'
                : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Laatste uitslag terugdraaien</span>
            {canUndo && undoCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {undoCount}
              </span>
            )}
          </button>

          {/* 2. RESET TOURNAMENT TO 0 BUTTON */}
          <button
            id="btn-reset-tournament-to-zero"
            type="button"
            onClick={onOpenResetScoresModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/60 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Alle uitslagen wissen en toernooi op 0 zetten"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Toernooi op 0 zetten</span>
          </button>

          {/* 3. TEAMS MANAGE BUTTON */}
          <button
            id="btn-admin-bar-teams"
            type="button"
            onClick={onOpenTeamManager}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teams</span>
          </button>

          {/* 4. CHANGE PIN */}
          <button
            id="btn-admin-bar-pin"
            type="button"
            onClick={onOpenChangePin}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Beheerderscode wijzigen"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Code</span>
          </button>

          {/* 5. LOGOUT */}
          <button
            id="btn-admin-bar-logout"
            type="button"
            onClick={onAdminLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800/70 border border-slate-800 transition"
            title="Beheerdersmodus verlaten"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Klaar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
