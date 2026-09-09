import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Flame,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Match, Team, UserRole } from '../types';
import { sounds } from '../utils/audio';

interface NextMatchHighlightProps {
  currentMatch: Match | null;
  allMatches: Match[];
  teams: Team[];
  role: UserRole;
  onUpdateScore: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status?: Match['status'],
    homePenalties?: number | null,
    awayPenalties?: number | null
  ) => void;
  onSelectMatchIndex: (index: number) => void;
  selectedMatchIndex: number;
}

export const NextMatchHighlight: React.FC<NextMatchHighlightProps> = ({
  currentMatch,
  allMatches,
  teams,
  role,
  onUpdateScore,
  onSelectMatchIndex,
  selectedMatchIndex,
}) => {
  const match = currentMatch;

  // Local draft scores for admin inline editing
  const [localHomeScore, setLocalHomeScore] = useState<number>(0);
  const [localAwayScore, setLocalAwayScore] = useState<number>(0);
  const [localHomePens, setLocalHomePens] = useState<number>(0);
  const [localAwayPens, setLocalAwayPens] = useState<number>(0);
  const [showPenaltiesInput, setShowPenaltiesInput] = useState(false);

  useEffect(() => {
    if (match) {
      setLocalHomeScore(match.homeScore ?? 0);
      setLocalAwayScore(match.awayScore ?? 0);
      setLocalHomePens(match.homePenalties ?? 0);
      setLocalAwayPens(match.awayPenalties ?? 0);
      setShowPenaltiesInput(
        match.stage !== 'group' &&
          match.homeScore !== null &&
          match.awayScore !== null &&
          match.homeScore === match.awayScore
      );
    }
  }, [match?.id, match?.homeScore, match?.awayScore, match?.homePenalties, match?.awayPenalties]);

  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  const isKnockout = match && match.stage !== 'group';
  const isTied = localHomeScore === localAwayScore;

  const handleSaveScore = () => {
    if (!match) return;
    const isFinished = true;
    sounds.playGoal();
    onUpdateScore(
      match.id,
      localHomeScore,
      localAwayScore,
      isFinished ? 'finished' : 'live',
      isKnockout && isTied ? localHomePens : null,
      isKnockout && isTied ? localAwayPens : null
    );
  };

  const handleStartMatch = () => {
    if (!match) return;
    sounds.playWhistle();
    onUpdateScore(
      match.id,
      match.homeScore ?? 0,
      match.awayScore ?? 0,
      'live',
      match.homePenalties,
      match.awayPenalties
    );
  };

  const handleResetMatch = () => {
    if (!match) return;
    onUpdateScore(match.id, null, null, 'scheduled', null, null);
  };

  // If no match available (e.g. tournament finished)
  if (!match) {
    const finalMatch = allMatches.find((m) => m.stage === 'final');
    const championId =
      finalMatch && finalMatch.homeScore !== null && finalMatch.awayScore !== null
        ? finalMatch.homeScore > finalMatch.awayScore
          ? finalMatch.homeTeamId
          : finalMatch.awayScore > finalMatch.homeScore
          ? finalMatch.awayTeamId
          : (finalMatch.homePenalties ?? 0) > (finalMatch.awayPenalties ?? 0)
          ? finalMatch.homeTeamId
          : finalMatch.awayTeamId
        : null;

    const champion = teams.find((t) => t.id === championId);

    return (
      <section id="next-match-highlight" className="my-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4">
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Toernooi Voltooid!</h2>
          {champion ? (
            <div className="mt-3">
              <p className="text-slate-300 text-sm">Gefeliciteerd aan de toernooikampioen:</p>
              <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-lg sm:text-xl">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {champion.name}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Spelers: {champion.players.join(' • ')}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm mt-2">Alle wedstrijden zijn afgerond.</p>
          )}
        </div>
      </section>
    );
  }

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <section id="next-match-highlight" className="my-5">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-slate-900 shadow-2xl p-4 sm:p-6 transition-all">
        {/* Pitch Turf Grid Ambient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Bar: Highlight Status, Stage, Pitch & Time */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-900/40">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500 text-white animate-pulse shadow-md shadow-rose-900/50">
                <Flame className="w-3.5 h-3.5" /> Nu Bezig
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Afgelopen
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Volgende Wedstrijd
              </span>
            )}

            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {match.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {match.scheduledTime}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-medium text-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {match.pitch}
            </span>

            {/* Pagination between matches */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
              <button
                type="button"
                aria-label="Vorige wedstrijd"
                disabled={selectedMatchIndex <= 0}
                onClick={() => onSelectMatchIndex(selectedMatchIndex - 1)}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedMatchIndex + 1}/{allMatches.length}
              </span>
              <button
                type="button"
                aria-label="Volgende wedstrijd"
                disabled={selectedMatchIndex >= allMatches.length - 1}
                onClick={() => onSelectMatchIndex(selectedMatchIndex + 1)}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Scoreboard: Home vs Away */}
        <div className="relative z-10 py-5 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6">
            
            {/* Home Team Card */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end text-center md:text-right">
              <div className="flex items-center gap-3 mb-1.5 flex-row-reverse md:flex-row">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  {homeTeam?.name ||
                    (match.stage === 'third_place'
                      ? 'Verliezer Halve Finale 1'
                      : match.stage === 'final'
                      ? 'Winnaar Halve Finale 1'
                      : 'TBD (Kwalificatie)')}
                </span>
                <div
                  className="w-5 h-5 rounded-full ring-2 ring-white/20 shrink-0 shadow-md"
                  style={{ backgroundColor: homeTeam?.color || '#64748b' }}
                />
              </div>

              {/* Home Team Players */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {homeTeam
                    ? homeTeam.players.join(' • ')
                    : match.stage === 'third_place'
                    ? 'Stroomt in na verlies in Halve Finale 1'
                    : 'Wachten op uitslag'}
                </span>
              </div>
            </div>

            {/* Middle Scoreboard / VS */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              {role === 'admin' ? (
                /* Admin Live Score Controls */
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 bg-slate-950/90 px-4 py-2 rounded-2xl border border-emerald-600/30 shadow-inner">
                    {/* Home Score Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLocalHomeScore(Math.max(0, localHomeScore - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={localHomeScore}
                        onChange={(e) => setLocalHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center text-3xl font-black text-white bg-transparent border-0 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLocalHomeScore(localHomeScore + 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition shadow"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xl font-bold text-slate-500">:</span>

                    {/* Away Score Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLocalAwayScore(Math.max(0, localAwayScore - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={localAwayScore}
                        onChange={(e) => setLocalAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center text-3xl font-black text-white bg-transparent border-0 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLocalAwayScore(localAwayScore + 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition shadow"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* If Knockout match and tied: penalty shootout section */}
                  {isKnockout && isTied && (
                    <div className="mt-1 p-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-center w-full">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                        Strafschoppen (Gelijke stand vereist winnaar)
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setLocalHomePens(Math.max(0, localHomePens - 1))}
                            className="w-6 h-6 rounded bg-slate-800 text-xs text-white"
                          >
                            -
                          </button>
                          <span className="font-bold text-amber-200 text-base w-6 text-center">
                            {localHomePens}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocalHomePens(localHomePens + 1)}
                            className="w-6 h-6 rounded bg-amber-600 text-xs text-white"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">pen.</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setLocalAwayPens(Math.max(0, localAwayPens - 1))}
                            className="w-6 h-6 rounded bg-slate-800 text-xs text-white"
                          >
                            -
                          </button>
                          <span className="font-bold text-amber-200 text-base w-6 text-center">
                            {localAwayPens}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocalAwayPens(localAwayPens + 1)}
                            className="w-6 h-6 rounded bg-amber-600 text-xs text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Quick Action Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleSaveScore}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Uitslag Opslaan
                    </button>

                    {!isLive && !isFinished && (
                      <button
                        type="button"
                        onClick={handleStartMatch}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        Start Live
                      </button>
                    )}

                    {(isLive || isFinished) && (
                      <button
                        type="button"
                        onClick={handleResetMatch}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                        title="Uitslag wissen / herstarten"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Spectator View Scoreboard */
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      {match.homeScore !== null ? match.homeScore : '-'}
                    </span>
                    <span className="text-xl font-bold text-emerald-500/80">:</span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      {match.awayScore !== null ? match.awayScore : '-'}
                    </span>
                  </div>

                  {/* Knockout Penalties Display if applicable */}
                  {isKnockout &&
                    match.homeScore !== null &&
                    match.awayScore !== null &&
                    match.homeScore === match.awayScore &&
                    match.homePenalties !== null &&
                    match.awayPenalties !== null && (
                      <span className="text-xs font-semibold text-amber-400 mt-1.5 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-600/30">
                        Strafschoppen: {match.homePenalties} - {match.awayPenalties}
                      </span>
                    )}

                  {match.status === 'scheduled' && (
                    <span className="text-xs font-medium text-slate-400 mt-2">
                      Aanvang: {match.scheduledTime}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Away Team Card */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className="w-5 h-5 rounded-full ring-2 ring-white/20 shrink-0 shadow-md"
                  style={{ backgroundColor: awayTeam?.color || '#64748b' }}
                />
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  {awayTeam?.name ||
                    (match.stage === 'third_place'
                      ? 'Verliezer Halve Finale 2'
                      : match.stage === 'final'
                      ? 'Winnaar Halve Finale 2'
                      : 'TBD (Kwalificatie)')}
                </span>
              </div>

              {/* Away Team Players */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {awayTeam
                    ? awayTeam.players.join(' • ')
                    : match.stage === 'third_place'
                    ? 'Stroomt in na verlies in Halve Finale 2'
                    : 'Wachten op uitslag'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
