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
  Plus,
  Trash2,
  Radio,
} from 'lucide-react';
import { Match, Team, UserRole, GoalEvent } from '../types';
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
    awayPenalties?: number | null,
    goals?: GoalEvent[]
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

  // Local draft state for scores, penalties, and goals
  const [localHomeScore, setLocalHomeScore] = useState<number>(0);
  const [localAwayScore, setLocalAwayScore] = useState<number>(0);
  const [localHomePens, setLocalHomePens] = useState<number>(0);
  const [localAwayPens, setLocalAwayPens] = useState<number>(0);
  const [localGoals, setLocalGoals] = useState<GoalEvent[]>([]);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalTeam, setCustomGoalTeam] = useState<'home' | 'away'>('home');

  useEffect(() => {
    if (match) {
      setLocalHomeScore(match.homeScore ?? 0);
      setLocalAwayScore(match.awayScore ?? 0);
      setLocalHomePens(match.homePenalties ?? 0);
      setLocalAwayPens(match.awayPenalties ?? 0);
      setLocalGoals(match.goals || []);
    }
  }, [
    match?.id,
    match?.homeScore,
    match?.awayScore,
    match?.homePenalties,
    match?.awayPenalties,
    match?.goals,
  ]);

  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  const isKnockout = match && match.stage !== 'group';
  const isTied = localHomeScore === localAwayScore;
  const isLive = match?.status === 'live';
  const isFinished = match?.status === 'finished';

  // Add goal for a specific player and update score
  const handleAddPlayerGoal = (teamType: 'home' | 'away', playerName: string) => {
    if (!match) return;
    const teamId = teamType === 'home' ? match.homeTeamId : match.awayTeamId;
    if (!teamId) return;

    sounds.playGoal();

    const newGoal: GoalEvent = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      teamId,
      playerName: playerName.trim(),
      minute: Math.floor(Math.random() * 15) + 1,
    };

    const newGoals = [...localGoals, newGoal];
    setLocalGoals(newGoals);

    const newHome = teamType === 'home' ? localHomeScore + 1 : localHomeScore;
    const newAway = teamType === 'away' ? localAwayScore + 1 : localAwayScore;

    if (teamType === 'home') setLocalHomeScore(newHome);
    if (teamType === 'away') setLocalAwayScore(newAway);

    // If currently live, immediately push to other devices via Firestore sync!
    if (isLive) {
      onUpdateScore(
        match.id,
        newHome,
        newAway,
        'live',
        isKnockout && newHome === newAway ? localHomePens : null,
        isKnockout && newHome === newAway ? localAwayPens : null,
        newGoals
      );
    }
  };

  // Remove a goal
  const handleRemoveGoal = (goalId: string) => {
    if (!match) return;
    const goalToRemove = localGoals.find((g) => g.id === goalId);
    if (!goalToRemove) return;

    const newGoals = localGoals.filter((g) => g.id !== goalId);
    setLocalGoals(newGoals);

    const isHome = goalToRemove.teamId === match.homeTeamId;
    const newHome = isHome ? Math.max(0, localHomeScore - 1) : localHomeScore;
    const newAway = !isHome ? Math.max(0, localAwayScore - 1) : localAwayScore;

    if (isHome) setLocalHomeScore(newHome);
    else setLocalAwayScore(newAway);

    // If live, sync immediately
    if (isLive) {
      onUpdateScore(
        match.id,
        newHome,
        newAway,
        'live',
        isKnockout && newHome === newAway ? localHomePens : null,
        isKnockout && newHome === newAway ? localAwayPens : null,
        newGoals
      );
    }
  };

  // Manual score stepper change
  const handleStepperChange = (teamType: 'home' | 'away', delta: number) => {
    if (!match) return;
    const newHome = teamType === 'home' ? Math.max(0, localHomeScore + delta) : localHomeScore;
    const newAway = teamType === 'away' ? Math.max(0, localAwayScore + delta) : localAwayScore;

    if (teamType === 'home') setLocalHomeScore(newHome);
    if (teamType === 'away') setLocalAwayScore(newAway);

    if (isLive) {
      onUpdateScore(
        match.id,
        newHome,
        newAway,
        'live',
        isKnockout && newHome === newAway ? localHomePens : null,
        isKnockout && newHome === newAway ? localAwayPens : null,
        localGoals
      );
    }
  };

  // Save Final Score (Afgelopen)
  const handleSaveScore = () => {
    if (!match) return;
    sounds.playGoal();
    onUpdateScore(
      match.id,
      localHomeScore,
      localAwayScore,
      'finished',
      isKnockout && isTied ? localHomePens : null,
      isKnockout && isTied ? localAwayPens : null,
      localGoals
    );
  };

  // Start Live Match
  const handleStartLiveMatch = () => {
    if (!match) return;
    sounds.playWhistle();
    onUpdateScore(
      match.id,
      localHomeScore,
      localAwayScore,
      'live',
      isKnockout && isTied ? localHomePens : null,
      isKnockout && isTied ? localAwayPens : null,
      localGoals
    );
  };

  // Sync Live Score explicitly
  const handleBroadcastLiveScore = () => {
    if (!match) return;
    sounds.playWhistle();
    onUpdateScore(
      match.id,
      localHomeScore,
      localAwayScore,
      'live',
      isKnockout && isTied ? localHomePens : null,
      isKnockout && isTied ? localAwayPens : null,
      localGoals
    );
  };

  // Reset match score back to scheduled
  const handleResetMatch = () => {
    if (!match) return;
    setLocalHomeScore(0);
    setLocalAwayScore(0);
    setLocalGoals([]);
    onUpdateScore(match.id, null, null, 'scheduled', null, null, []);
  };

  if (!match) {
    return (
      <section id="next-match-highlight" className="my-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-50" />
          <h2 className="text-xl font-bold text-white">Toernooi Overzicht</h2>
          <p className="text-slate-400 text-sm mt-2">Alle wedstrijden zijn afgerond.</p>
        </div>
      </section>
    );
  }

  // Goals separated by team for display
  const homeGoalsList = localGoals.filter((g) => g.teamId === match.homeTeamId);
  const awayGoalsList = localGoals.filter((g) => g.teamId === match.awayTeamId);

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/60">
                <Radio className="w-3.5 h-3.5 text-white animate-spin" /> LIVE WEDSTRIJD
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

        {/* Live Broadcast Notice for Spectators & Admin */}
        {isLive && (
          <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span>
                <strong>Live stand actief:</strong> Iedereen op elk apparaat ziet deze score en topscorers nu realtime veranderen!
              </span>
            </div>
            {role === 'admin' && (
              <span className="text-[11px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 border border-rose-500/40">
                Beheerder Live Uitzending
              </span>
            )}
          </div>
        )}

        {/* Main Scoreboard: Home vs Away */}
        <div className="relative z-10 py-5 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-4 sm:gap-6">
            
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

              {/* Admin: Quick Goal Buttons per player for Home Team */}
              {role === 'admin' && homeTeam && (
                <div className="mt-3 w-full flex flex-col items-center md:items-end">
                  <span className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                    ⚽ Doelpunt toekennen ({homeTeam.name}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-end">
                    {homeTeam.players.map((playerName) => (
                      <button
                        key={playerName}
                        type="button"
                        onClick={() => handleAddPlayerGoal('home', playerName)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 text-xs font-semibold shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        title={`Doelpunt toevoegen voor ${playerName}`}
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>{playerName.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scored Goals List (Home) */}
              {homeGoalsList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center md:justify-end">
                  {homeGoalsList.map((g) => (
                    <span
                      key={g.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-emerald-300"
                    >
                      <span>⚽ {g.playerName}</span>
                      {role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(g.id)}
                          className="text-slate-400 hover:text-rose-400 ml-1"
                          title="Doelpunt wissen"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Middle Scoreboard / Score Controls */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              {role === 'admin' ? (
                /* Admin Live Score Controls */
                <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                  <div className="flex items-center justify-center gap-3 bg-slate-950/90 px-4 py-2.5 rounded-2xl border border-emerald-600/40 shadow-inner w-full">
                    {/* Home Score Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepperChange('home', -1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={localHomeScore}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setLocalHomeScore(val);
                          if (isLive) {
                            onUpdateScore(match.id, val, localAwayScore, 'live', localHomePens, localAwayPens, localGoals);
                          }
                        }}
                        className="w-12 text-center text-3xl sm:text-4xl font-black text-white bg-transparent border-0 focus:ring-0 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepperChange('home', 1)}
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
                        onClick={() => handleStepperChange('away', -1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={localAwayScore}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setLocalAwayScore(val);
                          if (isLive) {
                            onUpdateScore(match.id, localHomeScore, val, 'live', localHomePens, localAwayPens, localGoals);
                          }
                        }}
                        className="w-12 text-center text-3xl sm:text-4xl font-black text-white bg-transparent border-0 focus:ring-0 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepperChange('away', 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition shadow"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Knockout Tie Penalties */}
                  {isKnockout && isTied && (
                    <div className="mt-1 p-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-center w-full">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
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

                  {/* Admin Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {/* Live Match Toggle */}
                    {isLive ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveScore}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Eindstand Opslaan</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBroadcastLiveScore}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition flex items-center gap-1 cursor-pointer"
                          title="Stand nu geforceerd synchroniseren naar alle schermen"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Sync Live</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleStartLiveMatch}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                          title="Start de wedstrijd live zodat toeschouwers elke goal direct zien"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveScore}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md active:scale-95 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Uitslag Opslaan</span>
                        </button>
                      </>
                    )}

                    {(isLive || isFinished || localHomeScore > 0 || localAwayScore > 0) && (
                      <button
                        type="button"
                        onClick={handleResetMatch}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                        title="Deze wedstrijd resetten naar ongespeeld (0-0)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Spectator View Scoreboard */
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4 bg-slate-950/90 px-6 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      {match.homeScore !== null ? match.homeScore : '-'}
                    </span>
                    <span className="text-xl font-bold text-emerald-500/80">:</span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      {match.awayScore !== null ? match.awayScore : '-'}
                    </span>
                  </div>

                  {/* Knockout Penalties Display */}
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

              {/* Admin: Quick Goal Buttons per player for Away Team */}
              {role === 'admin' && awayTeam && (
                <div className="mt-3 w-full flex flex-col items-center md:items-start">
                  <span className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                    ⚽ Doelpunt toekennen ({awayTeam.name}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {awayTeam.players.map((playerName) => (
                      <button
                        key={playerName}
                        type="button"
                        onClick={() => handleAddPlayerGoal('away', playerName)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 text-xs font-semibold shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        title={`Doelpunt toevoegen voor ${playerName}`}
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>{playerName.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scored Goals List (Away) */}
              {awayGoalsList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {awayGoalsList.map((g) => (
                    <span
                      key={g.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-emerald-300"
                    >
                      <span>⚽ {g.playerName}</span>
                      {role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(g.id)}
                          className="text-slate-400 hover:text-rose-400 ml-1"
                          title="Doelpunt wissen"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
