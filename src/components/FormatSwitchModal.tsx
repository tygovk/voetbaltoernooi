import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { TournamentFormat } from '../types';
import { sounds } from '../utils/audio';

interface FormatSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFormat: TournamentFormat;
  currentFormat: TournamentFormat;
  completedMatchesCount: number;
  onConfirmSwitch: (format: TournamentFormat) => void;
}

export const FormatSwitchModal: React.FC<FormatSwitchModalProps> = ({
  isOpen,
  onClose,
  targetFormat,
  currentFormat,
  completedMatchesCount,
  onConfirmSwitch,
}) => {
  if (!isOpen) return null;

  const isSwitchingTo6 = targetFormat === '6_teams';
  const targetCount = isSwitchingTo6 ? 6 : 8;
  const targetPoolCount = isSwitchingTo6 ? 3 : 4;
  const targetGroupMatches = isSwitchingTo6 ? 6 : 12;

  const handleConfirm = () => {
    sounds.playWhistle();
    onConfirmSwitch(targetFormat);
    onClose();
  };

  return (
    <div
      id="format-switch-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isSwitchingTo6
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              Wisselen naar {targetCount} Teams
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              2 poules van {targetPoolCount} teams • Behoud van halve finales & finale
            </p>
          </div>
        </div>

        {/* Detail points */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 mb-5 space-y-2.5 text-xs">
          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Poule-indeling:</strong> 2 poules van elk{' '}
              <strong>{targetPoolCount} teams</strong> ({targetGroupMatches} poulewedstrijden in totaal).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <GitBranch className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Halve finales & finale blijven actief:</strong> De nummers 1 en 2 van elke poule plaatsen zich automatisch voor Halve Finale 1 (A1 vs B2) en Halve Finale 2 (B1 vs A2).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Alle functies behouden:</strong> Live scorebalk, topscorersstand, doelpuntenmakers met score-notatie (bijv. 1-0), strafschoppen en eindstand functioneren direct.
            </span>
          </div>

          {completedMatchesCount > 0 && (
            <div className="flex items-start gap-2 text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Let op:</strong> Er zijn reeds {completedMatchesCount} wedstrijden gespeeld. Deze worden gereset voor het nieuwe wedstrijdschema. Je kunt dit altijd herstellen via 'Uitslag Terugdraaien'.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            id="btn-confirm-format-switch"
            type="button"
            onClick={handleConfirm}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition active:scale-[0.99] cursor-pointer ${
              isSwitchingTo6
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ja, wissel naar {targetCount} teams in 2 pools</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};
