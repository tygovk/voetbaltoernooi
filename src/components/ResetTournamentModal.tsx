import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  X,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ResetTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetScores: () => void;
  onResetAll: () => void;
  completedMatchesCount: number;
}

export const ResetTournamentModal: React.FC<ResetTournamentModalProps> = ({
  isOpen,
  onClose,
  onResetScores,
  onResetAll,
  completedMatchesCount,
}) => {
  const [showFactoryReset, setShowFactoryReset] = useState(false);

  if (!isOpen) return null;

  const handleConfirmScoresReset = () => {
    sounds.playWhistle();
    onResetScores();
    onClose();
  };

  const handleConfirmFactoryReset = () => {
    sounds.playBuzzer();
    onResetAll();
    onClose();
  };

  return (
    <div
      id="reset-tournament-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-reset-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Toernooi op 0 zetten</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Alle uitslagen wissen en opnieuw beginnen
            </p>
          </div>
        </div>

        {/* Warning / Explanation Box */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 mb-5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Teams & spelers blijven behouden:</strong> Alle 8 teams en de ingevoerde 3 spelers per team blijven ongewijzigd.
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Scores op 0:</strong> {completedMatchesCount > 0 ? (
                <span>Alle <strong>{completedMatchesCount}</strong> ingevoerde uitslagen en doelpunten worden gewist.</span>
              ) : (
                <span>Alle standen en doelsaldi worden gereset.</span>
              )}
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Terugdraaibaar:</strong> Per ongeluk geklikt? Je kunt deze reset direct met de knop <em>'Laatste uitslag terugdraaien'</em> herstellen.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="btn-confirm-reset-scores"
            type="button"
            onClick={handleConfirmScoresReset}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition active:scale-[0.99] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ja, alle uitslagen wissen (toernooi op 0)</span>
          </button>

          <button
            id="btn-cancel-reset"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
          >
            Annuleren
          </button>
        </div>

        {/* Optional Factory Reset Expander */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            id="btn-toggle-factory-reset"
            type="button"
            onClick={() => setShowFactoryReset(!showFactoryReset)}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            <span>Wil je ook alle teamnamen en spelers resetten?</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFactoryReset ? 'rotate-180' : ''}`} />
          </button>

          {showFactoryReset && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-left animate-in fade-in">
              <div className="flex items-start gap-2 text-rose-300 text-xs mb-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Let op:</strong> Dit herstelt het toernooi inclusief teams en spelers naar de standaard fabrieksinstellingen.
                </span>
              </div>
              <button
                id="btn-confirm-factory-reset"
                type="button"
                onClick={handleConfirmFactoryReset}
                className="w-full py-2 px-3 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-semibold text-xs border border-rose-700/60 transition"
              >
                Volledige fabrieksreset uitvoeren
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
