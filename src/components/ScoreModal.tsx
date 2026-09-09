import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Flame, Users, Trophy } from 'lucide-react';
import { Match, Team } from '../types';
import { sounds } from '../utils/audio';

interface ScoreModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onSave: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status?: Match['status'],
    homePenalties?: number | null,
    awayPenalties?: number | null
  ) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  teams,
  onSave,
}) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homePens, setHomePens] = useState<number>(0);
  const [awayPens, setAwayPens] = useState<number>(0);

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setHomePens(match.homePenalties ?? 0);
      setAwayPens(match.awayPenalties ?? 0);
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);

  const isKnockout = match.stage !== 'group';
  const isTied = homeScore === awayScore;

  const handleSave = () => {
    sounds.playGoal();
    onSave(
      match.id,
      homeScore,
      awayScore,
      'finished',
      isKnockout && isTied ? homePens : null,
      isKnockout && isTied ? awayPens : null
    );
    onClose();
  };

  const handleClear = () => {
    onSave(match.id, null, null, 'scheduled', null, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {match.label}
            </span>
            <div className="text-xs text-slate-400">
              {match.scheduledTime} • {match.pitch}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Counters */}
        <div className="py-6">
          <div className="grid grid-cols-11 items-center gap-2">
            
            {/* Home Team */}
            <div className="col-span-5 text-center flex flex-col items-center">
              <span
                className="w-4 h-4 rounded-full mb-2 shadow"
                style={{ backgroundColor: home?.color || '#64748b' }}
              />
              <span className="font-extrabold text-base sm:text-lg text-white line-clamp-1">
                {home?.name || 'Onbekend'}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {home?.players.join(', ')}
              </span>

              {/* Counter Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 shadow"
                >
                  -
                </button>
                <span className="text-4xl font-black text-white font-mono w-12 text-center">
                  {homeScore}
                </span>
                <button
                  type="button"
                  onClick={() => setHomeScore(homeScore + 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl active:scale-95 shadow"
                >
                  +
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="col-span-1 text-center font-bold text-2xl text-slate-600 font-mono">
              :
            </div>

            {/* Away Team */}
            <div className="col-span-5 text-center flex flex-col items-center">
              <span
                className="w-4 h-4 rounded-full mb-2 shadow"
                style={{ backgroundColor: away?.color || '#64748b' }}
              />
              <span className="font-extrabold text-base sm:text-lg text-white line-clamp-1">
                {away?.name || 'Onbekend'}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {away?.players.join(', ')}
              </span>

              {/* Counter Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 shadow"
                >
                  -
                </button>
                <span className="text-4xl font-black text-white font-mono w-12 text-center">
                  {awayScore}
                </span>
                <button
                  type="button"
                  onClick={() => setAwayScore(awayScore + 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl active:scale-95 shadow"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Penalties for Knockout */}
          {isKnockout && isTied && (
            <div className="mt-6 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                Gelijke stand in knock-out: Vul strafschoppen in
              </span>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">{home?.name}:</span>
                  <button
                    type="button"
                    onClick={() => setHomePens(Math.max(0, homePens - 1))}
                    className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-amber-200 text-lg w-6 text-center">{homePens}</span>
                  <button
                    type="button"
                    onClick={() => setHomePens(homePens + 1)}
                    className="w-7 h-7 rounded bg-amber-600 text-white font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="text-slate-500 font-bold">vs</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAwayPens(Math.max(0, awayPens - 1))}
                    className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-amber-200 text-lg w-6 text-center">{awayPens}</span>
                  <button
                    type="button"
                    onClick={() => setAwayPens(awayPens + 1)}
                    className="w-7 h-7 rounded bg-amber-600 text-white font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-300 font-medium">{away?.name}:</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Uitslag Wissen
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Opslaan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
