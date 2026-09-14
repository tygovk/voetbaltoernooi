import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Users,
  Shield,
  Award,
  Play,
  ArrowRight,
} from 'lucide-react';
import { Match, Team, UserRole } from '../types';
import {
  areAllGroupMatchesFinished,
  getKnockoutResult,
  calculateTournamentFinalRankings,
} from '../utils/standings';
import { sounds } from '../utils/audio';
import { TournamentRankings } from './TournamentRankings';

interface KnockoutBracketProps {
  matches: Match[];
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
  onSelectMatch: (match: Match) => void;
  onSimulateKnockouts?: () => void;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  matches,
  teams,
  role,
  onUpdateScore,
  onSelectMatch,
  onSimulateKnockouts,
}) => {
  const semi1 = matches.find((m) => m.id === 'match-semi-1');
  const semi2 = matches.find((m) => m.id === 'match-semi-2');
  const thirdMatch = matches.find((m) => m.id === 'match-third');
  const finalMatch = matches.find((m) => m.id === 'match-final');

  const allGroupsFinished = areAllGroupMatchesFinished(matches);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftHomeScore, setDraftHomeScore] = useState(0);
  const [draftAwayScore, setDraftAwayScore] = useState(0);
  const [draftHomePens, setDraftHomePens] = useState(0);
  const [draftAwayPens, setDraftAwayPens] = useState(0);

  const getTeam = (id: string | null) => (id ? teams.find((t) => t.id === id) : null);

  const startEdit = (m: Match, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(m.id);
    setDraftHomeScore(m.homeScore ?? 0);
    setDraftAwayScore(m.awayScore ?? 0);
    setDraftHomePens(m.homePenalties ?? 0);
    setDraftAwayPens(m.awayPenalties ?? 0);
  };

  const saveEdit = (m: Match, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playGoal();
    const isTied = draftHomeScore === draftAwayScore;
    onUpdateScore(
      m.id,
      draftHomeScore,
      draftAwayScore,
      'finished',
      isTied ? draftHomePens : null,
      isTied ? draftAwayPens : null
    );
    setEditingId(null);
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  // Determine Knockout Outcomes
  const semi1Result = semi1 ? getKnockoutResult(semi1) : { winnerId: null, loserId: null };
  const semi2Result = semi2 ? getKnockoutResult(semi2) : { winnerId: null, loserId: null };
  const finalResult = finalMatch ? getKnockoutResult(finalMatch) : { winnerId: null, loserId: null };
  const thirdResult = thirdMatch ? getKnockoutResult(thirdMatch) : { winnerId: null, loserId: null };

  const finalWinner = getTeam(finalResult.winnerId);
  const finalLoser = getTeam(finalResult.loserId);
  const thirdWinner = getTeam(thirdResult.winnerId);
  const thirdLoser = getTeam(thirdResult.loserId);

  // Dynamic Final Rankings
  const finalRankings = useMemo(
    () => calculateTournamentFinalRankings(teams, matches),
    [teams, matches]
  );

  // Check if Troostfinale is fully coupled
  const isTroostfinaleCoupled = Boolean(thirdMatch?.homeTeamId && thirdMatch?.awayTeamId);
  const isTroostfinaleFinished = Boolean(
    thirdMatch && thirdMatch.homeScore !== null && thirdMatch.awayScore !== null
  );

  const renderMatchCard = (
    match: Match | undefined,
    stageTitle: string,
    tagColor: string = 'text-emerald-400',
    options?: {
      isTroostfinale?: boolean;
      isFinal?: boolean;
      homePlaceholderText?: string;
      awayPlaceholderText?: string;
    }
  ) => {
    if (!match) return null;

    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);
    const isFinished = match.homeScore !== null && match.awayScore !== null;
    const isEditing = editingId === match.id;
    const isTied = isEditing && draftHomeScore === draftAwayScore;
    const isAwaitingPenalties =
      isFinished &&
      match.homeScore === match.awayScore &&
      (match.homePenalties === null || match.awayPenalties === null);

    const matchResult = getKnockoutResult(match);

    const isTroost = options?.isTroostfinale;
    const isGrandFinal = options?.isFinal;

    return (
      <div
        onClick={() => {
          if (!isEditing) onSelectMatch(match);
        }}
        className={`relative rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          isGrandFinal
            ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl hover:border-amber-400'
            : isTroost
            ? 'bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border-amber-600/40 shadow-xl hover:border-amber-500'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`font-extrabold ${tagColor} flex items-center gap-1`}>
              {stageTitle}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {match.scheduledTime}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-[11px]">{match.pitch}</span>
          </div>

          <div className="flex items-center gap-2">
            {isFinished ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Gespeeld
              </span>
            ) : match.homeTeamId && match.awayTeamId ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-950/70 text-sky-300 border border-sky-800/60">
                Klaar voor aftrap
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 italic">In afwachting</span>
            )}

            {role === 'admin' && match.homeTeamId && match.awayTeamId && !isEditing && (
              <button
                type="button"
                onClick={(e) => startEdit(match, e)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
                title="Uitslag invoeren / aanpassen"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Explain Automatic Pairing for Troostfinale */}
        {isTroost && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-200/90 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Medal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Automatische koppeling:</strong> Verliezer Halve Finale 1 vs Verliezer Halve Finale 2
              </span>
            </span>
            {isTroostfinaleCoupled && (
              <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                ✓ Teams Gekoppeld
              </span>
            )}
          </div>
        )}

        {/* Teams & Scores */}
        <div className="space-y-2">
          
          {/* Home Team Row */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              matchResult.winnerId === home?.id
                ? isGrandFinal
                  ? 'bg-amber-950/40 text-amber-200 font-bold border border-amber-500/50'
                  : isTroost
                  ? 'bg-amber-950/30 text-amber-200 font-bold border border-amber-600/50'
                  : 'bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-800/40'
                : 'bg-slate-950/70 text-slate-200 border border-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow ring-1 ring-white/10"
                style={{ backgroundColor: home?.color || '#475569' }}
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                  {home ? home.name : options?.homePlaceholderText || 'Wordt bepaald'}

                  {/* Badges for Winner */}
                  {matchResult.winnerId === home?.id && isGrandFinal && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400/50 font-black">
                      <Crown className="w-3 h-3 text-amber-400" /> Kampioen
                    </span>
                  )}
                  {matchResult.winnerId === home?.id && isTroost && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-600/30 text-amber-300 border border-amber-500/50 font-black">
                      <Medal className="w-3 h-3 text-amber-400" /> 3e Plaats (Brons)
                    </span>
                  )}
                  {matchResult.loserId === home?.id && isTroost && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      (4e Plaats)
                    </span>
                  )}
                </div>

                {home ? (
                  <div className="text-[11px] text-slate-400 truncate">
                    {home.players.join(', ')}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500">
                    {isTroost ? 'Verliezer van Halve Finale 1' : 'Poulewinnaar'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={draftHomeScore}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDraftHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-9 h-9 text-center text-sm font-extrabold bg-slate-900 border border-emerald-500 rounded-lg text-white shadow-inner"
                />
              ) : (
                <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg bg-slate-900/90 text-white min-w-[32px] text-center border border-slate-800">
                  {match.homeScore !== null ? match.homeScore : '-'}
                </span>
              )}
            </div>
          </div>

          {/* Away Team Row */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              matchResult.winnerId === away?.id
                ? isGrandFinal
                  ? 'bg-amber-950/40 text-amber-200 font-bold border border-amber-500/50'
                  : isTroost
                  ? 'bg-amber-950/30 text-amber-200 font-bold border border-amber-600/50'
                  : 'bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-800/40'
                : 'bg-slate-950/70 text-slate-200 border border-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow ring-1 ring-white/10"
                style={{ backgroundColor: away?.color || '#475569' }}
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                  {away ? away.name : options?.awayPlaceholderText || 'Wordt bepaald'}

                  {/* Badges for Winner */}
                  {matchResult.winnerId === away?.id && isGrandFinal && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400/50 font-black">
                      <Crown className="w-3 h-3 text-amber-400" /> Kampioen
                    </span>
                  )}
                  {matchResult.winnerId === away?.id && isTroost && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-600/30 text-amber-300 border border-amber-500/50 font-black">
                      <Medal className="w-3 h-3 text-amber-400" /> 3e Plaats (Brons)
                    </span>
                  )}
                  {matchResult.loserId === away?.id && isTroost && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      (4e Plaats)
                    </span>
                  )}
                </div>

                {away ? (
                  <div className="text-[11px] text-slate-400 truncate">
                    {away.players.join(', ')}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500">
                    {isTroost ? 'Verliezer van Halve Finale 2' : 'Poulewinnaar'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={draftAwayScore}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDraftAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-9 h-9 text-center text-sm font-extrabold bg-slate-900 border border-emerald-500 rounded-lg text-white shadow-inner"
                />
              ) : (
                <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg bg-slate-900/90 text-white min-w-[32px] text-center border border-slate-800">
                  {match.awayScore !== null ? match.awayScore : '-'}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Goalscorers Row (Visible to spectators and admins) */}
        {match.goals && match.goals.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            {/* Home Goals */}
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              {match.goals
                .filter((g) => g.teamId === match.homeTeamId)
                .map((g) => (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-medium text-[10px]"
                  >
                    <span>⚽</span>
                    <span>{g.playerName}</span>
                  </span>
                ))}
            </div>

            <span className="text-[10px] text-slate-500 shrink-0 font-bold">⚽</span>

            {/* Away Goals */}
            <div className="flex items-center gap-1 flex-wrap justify-end min-w-0 text-right">
              {match.goals
                .filter((g) => g.teamId === match.awayTeamId)
                .map((g) => (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-medium text-[10px]"
                  >
                    <span>⚽</span>
                    <span>{g.playerName}</span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Penalties Notice / Steppers if Tied */}
        {isEditing && isTied && (
          <div className="mt-2.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] font-bold text-amber-300 block mb-1">
              Gelijkspel in knock-out! Vul strafschoppen in:
            </span>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-300">{home?.name.split(' ')[0]}:</span>
              <input
                type="number"
                min="0"
                value={draftHomePens}
                onChange={(e) => setDraftHomePens(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-9 h-7 text-center font-bold bg-slate-900 border border-amber-400 rounded text-white"
              />
              <span className="text-slate-500 font-bold">-</span>
              <input
                type="number"
                min="0"
                value={draftAwayPens}
                onChange={(e) => setDraftAwayPens(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-9 h-7 text-center font-bold bg-slate-900 border border-amber-400 rounded text-white"
              />
              <span className="text-slate-300">:{away?.name.split(' ')[0]}</span>
            </div>
          </div>
        )}

        {/* Saved Penalties Display */}
        {isFinished &&
          match.homeScore === match.awayScore &&
          match.homePenalties !== null &&
          match.awayPenalties !== null && (
            <div className="mt-2 text-center text-xs font-semibold text-amber-300 bg-amber-950/40 py-1.5 rounded-lg border border-amber-600/30">
              Na strafschoppen: {match.homePenalties} - {match.awayPenalties} (
              {match.homePenalties > match.awayPenalties
                ? `${home?.name} wint pen.`
                : `${away?.name} wint pen.`}
              )
            </div>
          )}

        {isAwaitingPenalties && (
          <div className="mt-2 text-center text-xs text-rose-400 flex items-center justify-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Gelijkspel! Strafschoppen moeten nog worden ingevuld om winnaar te bepalen.
          </div>
        )}

        {/* Inline Edit Buttons */}
        {isEditing && (
          <div className="mt-3 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Annuleer
            </button>
            <button
              type="button"
              onClick={(e) => saveEdit(match, e)}
              className="px-4 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition"
            >
              Opslaan
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="knockout-section" className="my-6">
      {/* Title & Qualification Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Knock-outfase & Finales
          </h2>
          <p className="text-xs text-slate-400">
            Halve finales, Troostfinale (om de 3e & 4e plaats) en Grote Finale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allGroupsFinished ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Groepsfase Voltooid • Knock-outs actief
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-amber-300 border border-amber-600/40">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Voorlopige indeling (groepswedstrijden nog bezig)
            </span>
          )}

          {role === 'admin' && onSimulateKnockouts && (
            <button
              type="button"
              onClick={onSimulateKnockouts}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
              title="Vul automatisch representatieve scores in voor knock-outs om de flow te bekijken"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simuleer Knock-outs</span>
            </button>
          )}
        </div>
      </div>

      {/* Bracket Tree Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column: Semifinals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Halve Finales
              </h3>
            </div>
            <span className="text-xs text-slate-400">Plaats 1 & 2 naar Finale • Verliezers naar Troostfinale</span>
          </div>

          {renderMatchCard(semi1, 'Halve Finale 1 (A1 vs B2)', 'text-emerald-400', {
            homePlaceholderText: 'Poule A - 1e Plaats',
            awayPlaceholderText: 'Poule B - 2e Plaats',
          })}

          {renderMatchCard(semi2, 'Halve Finale 2 (B1 vs A2)', 'text-emerald-400', {
            homePlaceholderText: 'Poule B - 1e Plaats',
            awayPlaceholderText: 'Poule A - 2e Plaats',
          })}
        </div>

        {/* Right Column: Troostfinale & Grand Final */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Finaleronde & Troostfinale
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold">Beslist 1e t/m 4e plaats</span>
          </div>

          {/* Grand Final */}
          {renderMatchCard(finalMatch, 'Grote Finale 🏆', 'text-amber-400', {
            isFinal: true,
            homePlaceholderText: semi1Result.winnerId ? getTeam(semi1Result.winnerId)?.name : 'Winnaar Halve Finale 1',
            awayPlaceholderText: semi2Result.winnerId ? getTeam(semi2Result.winnerId)?.name : 'Winnaar Halve Finale 2',
          })}

          {/* Troostfinale (3rd Place Match) */}
          {renderMatchCard(thirdMatch, 'Troostfinale 🥉 (Wedstrijd om 3e & 4e plaats)', 'text-amber-500', {
            isTroostfinale: true,
            homePlaceholderText: semi1Result.loserId ? getTeam(semi1Result.loserId)?.name : 'Verliezer Halve Finale 1',
            awayPlaceholderText: semi2Result.loserId ? getTeam(semi2Result.loserId)?.name : 'Verliezer Halve Finale 2',
          })}
        </div>
      </div>

      {/* Live & Interactive Tournament Rankings (Eindrangschikking) */}
      <TournamentRankings
        rankings={finalRankings}
        role={role}
      />
    </section>
  );
};
