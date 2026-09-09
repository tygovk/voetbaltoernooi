import React from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Team, FinalTournamentRankingItem, UserRole } from '../types';

interface TournamentRankingsProps {
  rankings: FinalTournamentRankingItem[];
  role: UserRole;
  onSelectTeam?: (teamId: string) => void;
  onNavigateToKnockout?: () => void;
}

export const TournamentRankings: React.FC<TournamentRankingsProps> = ({
  rankings,
  role,
  onNavigateToKnockout,
}) => {
  const championItem = rankings.find((r) => r.rank === 1);
  const runnerUpItem = rankings.find((r) => r.rank === 2);
  const thirdItem = rankings.find((r) => r.rank === 3);
  const fourthItem = rankings.find((r) => r.rank === 4);

  const isThirdDecided = Boolean(thirdItem?.team);
  const isFourthDecided = Boolean(fourthItem?.team);
  const isFinalDecided = Boolean(championItem?.team);

  const getMedalBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm font-black text-xs">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-400/40 shadow-sm font-black text-xs">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-600/50 shadow-sm font-black text-xs">
            🥉
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-950/60 text-sky-300 border border-sky-700/50 shadow-sm font-bold text-xs">
            4e
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-mono text-xs">
            {rank}e
          </span>
        );
    }
  };

  return (
    <section id="tournament-rankings-section" className="my-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Eindrangschikking Toernooi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatische rangorde: 1e & 2e (Grote Finale), 3e & 4e (Troostfinale), 5e t/m 8e (Poulefase)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isThirdDecided ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-600/40 shadow-sm">
              <Medal className="w-3.5 h-3.5 text-amber-400" />
              Troostfinale beslist (3e & 4e plaats bekend)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-sky-300 border border-sky-600/40">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Troostfinale in afwachting
            </span>
          )}
        </div>
      </div>

      {/* Top 4 Podium Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* 1st Place - Champion */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> 1e Plaats • Kampioen
            </span>
            <span className="text-base">🥇</span>
          </div>

          <div className="py-2 text-center">
            {championItem?.team ? (
              <>
                <div className="inline-flex p-2.5 rounded-full bg-amber-500/20 border border-amber-400/40 mb-2 shadow-inner">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <h4 className="text-base font-extrabold text-white truncate">
                  {championItem.team.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300/80 mt-1 truncate">
                  <Users className="w-3 h-3" />
                  <span>{championItem.team.players.join(', ')}</span>
                </div>
                <div className="mt-2.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  Goud • Winnaar Finale
                </div>
              </>
            ) : (
              <div className="py-3 text-slate-400 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-500 font-bold">
                  ?
                </div>
                <div className="font-semibold text-slate-300 text-xs">{championItem?.placeholder}</div>
                <div className="text-[10px] text-slate-500 mt-1">Wordt beslist in Grote Finale</div>
              </div>
            )}
          </div>
        </div>

        {/* 2nd Place - Runner up */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-700/70 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-slate-300" /> 2e Plaats • Finalist
            </span>
            <span className="text-base">🥈</span>
          </div>

          <div className="py-2 text-center">
            {runnerUpItem?.team ? (
              <>
                <div className="inline-flex p-2.5 rounded-full bg-slate-700/30 border border-slate-500/40 mb-2">
                  <Medal className="w-7 h-7 text-slate-300" />
                </div>
                <h4 className="text-base font-extrabold text-white truncate">
                  {runnerUpItem.team.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-1 truncate">
                  <Users className="w-3 h-3" />
                  <span>{runnerUpItem.team.players.join(', ')}</span>
                </div>
                <div className="mt-2.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Zilver • Finalist
                </div>
              </>
            ) : (
              <div className="py-3 text-slate-400 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-500 font-bold">
                  ?
                </div>
                <div className="font-semibold text-slate-300 text-xs">{runnerUpItem?.placeholder}</div>
                <div className="text-[10px] text-slate-500 mt-1">Verliezer van Grote Finale</div>
              </div>
            )}
          </div>
        </div>

        {/* 3rd Place - Troostfinale Winner */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border border-amber-700/50 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-900/40">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-amber-500" /> 3e Plaats • Brons 🥉
            </span>
            <span className="text-base">🥉</span>
          </div>

          <div className="py-2 text-center">
            {thirdItem?.team ? (
              <>
                <div className="inline-flex p-2.5 rounded-full bg-amber-900/30 border border-amber-600/40 mb-2">
                  <Award className="w-7 h-7 text-amber-500" />
                </div>
                <h4 className="text-base font-extrabold text-white truncate">
                  {thirdItem.team.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400/80 mt-1 truncate">
                  <Users className="w-3 h-3" />
                  <span>{thirdItem.team.players.join(', ')}</span>
                </div>
                <div className="mt-2.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-700/60 shadow-sm">
                  Brons • Winnaar Troostfinale
                </div>
              </>
            ) : (
              <div className="py-3 text-slate-400 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-500 font-bold">
                  ?
                </div>
                <div className="font-semibold text-slate-300 text-xs">{thirdItem?.placeholder}</div>
                <div className="text-[10px] text-amber-400/80 mt-1">Wordt beslist in Troostfinale</div>
              </div>
            )}
          </div>
        </div>

        {/* 4th Place - Troostfinale Loser */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-sky-950/20 via-slate-900 to-slate-950 border border-sky-800/40 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-900/30">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> 4e Plaats
            </span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
              Troostfinale
            </span>
          </div>

          <div className="py-2 text-center">
            {fourthItem?.team ? (
              <>
                <div className="inline-flex p-2.5 rounded-full bg-sky-950/40 border border-sky-700/40 mb-2">
                  <Shield className="w-7 h-7 text-sky-400" />
                </div>
                <h4 className="text-base font-extrabold text-white truncate">
                  {fourthItem.team.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-1 truncate">
                  <Users className="w-3 h-3" />
                  <span>{fourthItem.team.players.join(', ')}</span>
                </div>
                <div className="mt-2.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Verliezer Troostfinale
                </div>
              </>
            ) : (
              <div className="py-3 text-slate-400 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-500 font-bold">
                  ?
                </div>
                <div className="font-semibold text-slate-300 text-xs">{fourthItem?.placeholder}</div>
                <div className="text-[10px] text-slate-500 mt-1">Verliezer van Troostfinale</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Complete Rankings Table (1 t/m 8) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Volledige Eindstand (1 t/m 8)
          </h3>
          <span className="text-xs text-slate-400">
            {rankings.filter((r) => r.status === 'confirmed').length} van 8 posities definitief
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">Positie</th>
                <th className="py-3 px-4">Team & Spelers</th>
                <th className="py-3 px-4">Prestatie / Fase</th>
                <th className="py-3 px-4 text-center">Ronde Afkomst</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {rankings.map((item) => {
                const team = item.team;
                const isConfirmed = item.status === 'confirmed';

                let rowBg = 'hover:bg-slate-800/40 transition';
                if (item.rank === 1 && isConfirmed) rowBg = 'bg-amber-950/20 hover:bg-amber-950/30';
                if (item.rank === 3 && isConfirmed) rowBg = 'bg-amber-950/10 hover:bg-amber-950/20';

                return (
                  <tr key={item.rank} className={rowBg}>
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{getMedalBadge(item.rank)}</div>
                    </td>

                    {/* Team & Players */}
                    <td className="py-3.5 px-4">
                      {team ? (
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white/10 shadow"
                            style={{ backgroundColor: team.color }}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                              {team.name}
                              {item.rank === 1 && isConfirmed && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              {item.rank === 3 && isConfirmed && (
                                <Medal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {team.players.join(' • ')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full shrink-0 bg-slate-800 border border-slate-700" />
                          <div>
                            <div className="font-medium text-slate-400 italic">
                              {item.placeholder}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.rank === 3
                                ? 'Winnaar van de Troostfinale'
                                : item.rank === 4
                                ? 'Verliezer van de Troostfinale'
                                : 'Wordt bepaald'}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Achievement */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">{item.achievement}</span>
                    </td>

                    {/* Stage Origin */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] bg-slate-950/70 border border-slate-800 text-slate-300">
                        {item.stageOrigin}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Definitief
                        </span>
                      ) : item.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-700/50">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Voorlopig
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
                          In afwachting
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
