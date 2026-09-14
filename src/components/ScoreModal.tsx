import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Flame,
  Users,
  Trophy,
  Plus,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Match, Team, GoalEvent, UserRole } from '../types';
import { sounds } from '../utils/audio';

interface ScoreModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  role?: UserRole;
  onSave: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status?: Match['status'],
    homePenalties?: number | null,
    awayPenalties?: number | null,
    goals?: GoalEvent[]
  ) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  teams,
  role = 'spectator',
  onSave,
}) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homePens, setHomePens] = useState<number>(0);
  const [awayPens, setAwayPens] = useState<number>(0);
  const [goals, setGoals] = useState<GoalEvent[]>([]);

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setHomePens(match.homePenalties ?? 0);
      setAwayPens(match.awayPenalties ?? 0);
      setGoals(match.goals || []);
    }
  }, [
    match?.id,
    match?.homeScore,
    match?.awayScore,
    match?.homePenalties,
    match?.awayPenalties,
    JSON.stringify(match?.goals),
  ]);

  if (!isOpen || !match) return null;

  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);

  const isKnockout = match.stage !== 'group';
  const isTied = homeScore === awayScore;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const handleAddGoal = (teamType: 'home' | 'away', playerName: string) => {
    const teamId = teamType === 'home' ? match.homeTeamId : match.awayTeamId;
    if (!teamId) return;

    sounds.playGoal();
    const newGoal: GoalEvent = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      teamId,
      playerName: playerName.trim(),
      minute: Math.floor(Math.random() * 15) + 1,
    };

    setGoals([...goals, newGoal]);
    if (teamType === 'home') setHomeScore((prev) => prev + 1);
    else setAwayScore((prev) => prev + 1);
  };

  const handleRemoveGoal = (goalId: string) => {
    const g = goals.find((item) => item.id === goalId);
    if (!g) return;
    setGoals(goals.filter((item) => item.id !== goalId));
    if (g.teamId === match.homeTeamId) {
      setHomeScore((prev) => Math.max(0, prev - 1));
    } else {
      setAwayScore((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSaveFinished = () => {
    sounds.playGoal();
    onSave(
      match.id,
      homeScore,
      awayScore,
      'finished',
      isKnockout && isTied ? homePens : null,
      isKnockout && isTied ? awayPens : null,
      goals
    );
    onClose();
  };

  const handleSaveLive = () => {
    sounds.playWhistle();
    onSave(
      match.id,
      homeScore,
      awayScore,
      'live',
      isKnockout && isTied ? homePens : null,
      isKnockout && isTied ? awayPens : null,
      goals
    );
    onClose();
  };

  const handleClear = () => {
    onSave(match.id, null, null, 'scheduled', null, null, []);
    onClose();
  };

  const homeGoals = goals.filter((g) => g.teamId === match.homeTeamId);
  const awayGoals = goals.filter((g) => g.teamId === match.awayTeamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {match.label}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  <Radio className="w-3 h-3 animate-spin" /> LIVE
                </span>
              ) : isFinished ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-300 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Afgelopen
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Gepland
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> {match.scheduledTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> {match.pitch}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Display (Spectator or Admin) */}
        {role === 'admin' ? (
          /* Admin Editable View */
          <div className="py-5">
            <div className="grid grid-cols-11 items-center gap-2">
              
              {/* Home Team */}
              <div className="col-span-5 text-center flex flex-col items-center">
                <span
                  className="w-4 h-4 rounded-full mb-1.5 shadow"
                  style={{ backgroundColor: home?.color || '#64748b' }}
                />
                <span className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                  {home?.name || 'Onbekend'}
                </span>

                {/* Counter Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg active:scale-95 shadow"
                  >
                    -
                  </button>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono w-10 text-center">
                    {homeScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg active:scale-95 shadow"
                  >
                    +
                  </button>
                </div>

                {/* Player Goal Assign Buttons */}
                {home && home.players.length > 0 && (
                  <div className="mt-3 w-full">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                      + Goal toekennen:
                    </span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {home.players.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleAddGoal('home', p)}
                          className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                        >
                          + {p.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals list */}
                {homeGoals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {homeGoals.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-300"
                      >
                        <span>⚽ {g.playerName.split(' ')[0]}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(g.id)}
                          className="text-slate-400 hover:text-rose-400 ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="col-span-1 text-center font-bold text-2xl text-slate-600 font-mono">
                :
              </div>

              {/* Away Team */}
              <div className="col-span-5 text-center flex flex-col items-center">
                <span
                  className="w-4 h-4 rounded-full mb-1.5 shadow"
                  style={{ backgroundColor: away?.color || '#64748b' }}
                />
                <span className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                  {away?.name || 'Onbekend'}
                </span>

                {/* Counter Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg active:scale-95 shadow"
                  >
                    -
                  </button>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono w-10 text-center">
                    {awayScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg active:scale-95 shadow"
                  >
                    +
                  </button>
                </div>

                {/* Player Goal Assign Buttons */}
                {away && away.players.length > 0 && (
                  <div className="mt-3 w-full">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                      + Goal toekennen:
                    </span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {away.players.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleAddGoal('away', p)}
                          className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                        >
                          + {p.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals list */}
                {awayGoals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {awayGoals.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-300"
                      >
                        <span>⚽ {g.playerName.split(' ')[0]}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(g.id)}
                          className="text-slate-400 hover:text-rose-400 ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Knockout Tie Penalties */}
            {isKnockout && isTied && (
              <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
                <span className="text-xs font-bold text-amber-300 block mb-2">
                  Gelijkspel in knock-out! Strafschoppen invoeren:
                </span>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-300">{home?.name.split(' ')[0]}:</span>
                    <button
                      type="button"
                      onClick={() => setHomePens(Math.max(0, homePens - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-xs text-white"
                    >
                      -
                    </button>
                    <span className="font-bold text-amber-300 text-sm w-4">{homePens}</span>
                    <button
                      type="button"
                      onClick={() => setHomePens(homePens + 1)}
                      className="w-6 h-6 rounded bg-amber-600 text-xs text-white"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-slate-500 font-bold">-</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAwayPens(Math.max(0, awayPens - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-xs text-white"
                    >
                      -
                    </button>
                    <span className="font-bold text-amber-300 text-sm w-4">{awayPens}</span>
                    <button
                      type="button"
                      onClick={() => setAwayPens(awayPens + 1)}
                      className="w-6 h-6 rounded bg-amber-600 text-xs text-white"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-300">{away?.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Spectator Read-Only View */
          <div className="py-5 space-y-4">
            {/* Big Score Display */}
            <div className="grid grid-cols-11 items-center gap-2 py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div className="col-span-5 text-center flex flex-col items-center px-2">
                <span
                  className="w-4 h-4 rounded-full mb-1 shadow"
                  style={{ backgroundColor: home?.color || '#64748b' }}
                />
                <span className="font-extrabold text-sm sm:text-base text-white truncate max-w-full">
                  {home?.name || 'Thuis'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  {match.homeScore !== null ? match.homeScore : '-'}
                </span>
              </div>

              <div className="col-span-1 text-center font-bold text-2xl text-emerald-500 font-mono">
                :
              </div>

              <div className="col-span-5 text-center flex flex-col items-center px-2">
                <span
                  className="w-4 h-4 rounded-full mb-1 shadow"
                  style={{ backgroundColor: away?.color || '#64748b' }}
                />
                <span className="font-extrabold text-sm sm:text-base text-white truncate max-w-full">
                  {away?.name || 'Uit'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  {match.awayScore !== null ? match.awayScore : '-'}
                </span>
              </div>
            </div>

            {/* Penalties result if applicable */}
            {isKnockout &&
              match.homeScore !== null &&
              match.awayScore !== null &&
              match.homeScore === match.awayScore &&
              match.homePenalties !== null &&
              match.awayPenalties !== null && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-600/30 text-center text-xs font-semibold text-amber-300">
                  Strafschoppen: {match.homePenalties} - {match.awayPenalties} (
                  {match.homePenalties > match.awayPenalties
                    ? `${home?.name} wint pen.`
                    : `${away?.name} wint pen.`}
                  )
                </div>
              )}

            {/* Goalscorers Section for Spectators */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Doelpuntenmakers
                </span>
                <span className="text-[11px] text-slate-400">
                  {goals.length} {goals.length === 1 ? 'doelpunt' : 'doelpunten'}
                </span>
              </div>

              {goals.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-2">
                  Nog geen doelpunten geregistreerd voor deze wedstrijd.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Home Team Goals */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {home?.name}:
                    </span>
                    {homeGoals.length === 0 ? (
                      <span className="text-[11px] text-slate-600 italic">Geen doelpunten</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {homeGoals.map((g) => (
                          <span
                            key={g.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-emerald-700/40 text-xs text-emerald-300 font-medium"
                          >
                            <span>⚽</span>
                            <span>{g.playerName}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Away Team Goals */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {away?.name}:
                    </span>
                    {awayGoals.length === 0 ? (
                      <span className="text-[11px] text-slate-600 italic">Geen doelpunten</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {awayGoals.map((g) => (
                          <span
                            key={g.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-emerald-700/40 text-xs text-emerald-300 font-medium"
                          >
                            <span>⚽</span>
                            <span>{g.playerName}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lineups */}
            <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Opstellingen (3 spelers per team):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <strong className="text-slate-300">{home?.name}:</strong>{' '}
                  {home?.players.join(', ') || 'Onbekend'}
                </div>
                <div>
                  <strong className="text-slate-300">{away?.name}:</strong>{' '}
                  {away?.players.join(', ') || 'Onbekend'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {role === 'admin' ? (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition flex items-center gap-1"
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
                  onClick={handleSaveLive}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md flex items-center gap-1 cursor-pointer"
                  title="Zet op 'Live' zodat anderen de tussenstand direct zien"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Live Stand Uitzenden
                </button>

                <button
                  type="button"
                  onClick={handleSaveFinished}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Eindstand Opslaan
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Sluiten
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
