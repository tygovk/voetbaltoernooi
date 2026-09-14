import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Search,
  Users,
  Medal,
  Sparkles,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { TopscorerItem, Team, UserRole } from '../types';

interface TopscorersRankingProps {
  topscorers: TopscorerItem[];
  teams: Team[];
  role: UserRole;
  onNavigateToMatches?: () => void;
}

export const TopscorersRanking: React.FC<TopscorersRankingProps> = ({
  topscorers,
  teams,
  role,
  onNavigateToMatches,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Filtered list based on search and team filter
  const filteredScorers = useMemo(() => {
    return topscorers.filter((item) => {
      const matchesSearch =
        item.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teamName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam =
        selectedTeamFilter === 'all' || item.teamId === selectedTeamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [topscorers, searchQuery, selectedTeamFilter]);

  // Aggregate statistics
  const totalGoals = useMemo(() => {
    return topscorers.reduce((acc, curr) => acc + curr.goals, 0);
  }, [topscorers]);

  const topScorer = topscorers[0] || null;

  return (
    <section id="topscorers-ranking-section" className="space-y-6">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/40">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Topscorersrangschikking
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-400" /> Live Update
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Gouden Schoen klassement • Automatisch bijgewerkt op elk apparaat
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
              <span className="block text-lg font-black text-white font-mono">{totalGoals}</span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Doelpunten</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
              <span className="block text-lg font-black text-amber-300 font-mono">
                {topscorers.length}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Schutters</span>
            </div>
          </div>
        </div>

        {/* Top Scorer Highlight Pill if available */}
        {topScorer && (
          <div className="mt-4 pt-3.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] shadow">
                #1 Topscorer
              </span>
              <span className="font-bold text-white text-sm">{topScorer.playerName}</span>
              <span className="text-slate-400">({topScorer.teamName})</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-bold">
              <span className="text-sm font-mono">{topScorer.goals}</span>
              <span className="text-xs">{topScorer.goals === 1 ? 'doelpunt' : 'doelpunten'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium (when at least 1 scorer exists) */}
      {topscorers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* #1 Gold */}
          {topscorers[0] && (
            <div className="relative order-1 sm:order-2 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/50 p-4 sm:p-5 shadow-lg flex flex-col items-center text-center">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-950" /> 1e Plaats (Goud)
              </div>
              <div className="w-12 h-12 rounded-full mt-2 mb-3 bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl shadow-inner">
                1
              </div>
              <span className="text-base sm:text-lg font-black text-white">{topscorers[0].playerName}</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: topscorers[0].teamColor }}
                />
                <span>{topscorers[0].teamName}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-sm font-black font-mono">
                ⚽ {topscorers[0].goals} {topscorers[0].goals === 1 ? 'goal' : 'goals'}
              </div>
            </div>
          )}

          {/* #2 Silver */}
          {topscorers[1] ? (
            <div className="order-2 sm:order-1 rounded-2xl bg-slate-900/90 border border-slate-700 p-4 sm:p-5 shadow flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full mb-2 bg-slate-700/50 border border-slate-500 flex items-center justify-center text-slate-200 font-bold text-base">
                2
              </div>
              <span className="text-sm sm:text-base font-bold text-white">{topscorers[1].playerName}</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: topscorers[1].teamColor }}
                />
                <span>{topscorers[1].teamName}</span>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold font-mono">
                ⚽ {topscorers[1].goals} {topscorers[1].goals === 1 ? 'goal' : 'goals'}
              </div>
            </div>
          ) : (
            <div className="order-2 sm:order-1 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 p-4 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Medal className="w-6 h-6 text-slate-600 mb-1" />
              <span>Nog geen 2e doelpuntenmaker</span>
            </div>
          )}

          {/* #3 Bronze */}
          {topscorers[2] ? (
            <div className="order-3 rounded-2xl bg-slate-900/90 border border-amber-900/40 p-4 sm:p-5 shadow flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full mb-2 bg-amber-900/30 border border-amber-700/50 flex items-center justify-center text-amber-400 font-bold text-base">
                3
              </div>
              <span className="text-sm sm:text-base font-bold text-white">{topscorers[2].playerName}</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: topscorers[2].teamColor }}
                />
                <span>{topscorers[2].teamName}</span>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/40 text-xs font-bold font-mono">
                ⚽ {topscorers[2].goals} {topscorers[2].goals === 1 ? 'goal' : 'goals'}
              </div>
            </div>
          ) : (
            <div className="order-3 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 p-4 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Medal className="w-6 h-6 text-slate-600 mb-1" />
              <span>Nog geen 3e doelpuntenmaker</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-topscorers-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek speler of team..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Team Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label htmlFor="team-filter-select" className="text-xs text-slate-400 whitespace-nowrap">
            Team:
          </label>
          <select
            id="team-filter-select"
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="all">Alle 8 Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Poule {t.group})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full Leaderboard Table / Cards */}
      {filteredScorers.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Trophy className="w-7 h-7 text-amber-500/60" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {searchQuery || selectedTeamFilter !== 'all'
              ? 'Geen doelpuntenmakers gevonden voor deze filter'
              : 'Nog geen doelpunten geregistreerd'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {searchQuery || selectedTeamFilter !== 'all'
              ? 'Pas je zoekopdracht of teamselectie aan om doelpuntenmakers te zien.'
              : 'Zodra de beheerder bij een wedstrijd op een speler klikt om een doelpunt in te voeren (of de uitslag invult), wordt deze ranglijst live en automatisch bijgewerkt voor iedereen!'}
          </p>

          {role === 'admin' && onNavigateToMatches && (
            <button
              type="button"
              onClick={onNavigateToMatches}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md active:scale-95"
            >
              <span>Naar de wedstrijden om uitslag & goals in te vullen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 sm:px-4 text-center w-12 sm:w-16">#</th>
                  <th className="py-3 px-3 sm:px-4">Speler</th>
                  <th className="py-3 px-3 sm:px-4">Team</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Doelpunten per wedstrijd</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Doelpunten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScorers.map((scorer, index) => {
                  const isGold = scorer.rank === 1;
                  const isSilver = scorer.rank === 2;
                  const isBronze = scorer.rank === 3;

                  return (
                    <tr
                      key={`${scorer.teamId}-${scorer.playerName}`}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isGold ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {isGold ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                            1
                          </span>
                        ) : isSilver ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs">
                            2
                          </span>
                        ) : isBronze ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono font-semibold">
                            {scorer.rank}
                          </span>
                        )}
                      </td>

                      {/* Player Name */}
                      <td className="py-3 px-3 sm:px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{scorer.playerName}</span>
                          {isGold && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold hidden sm:inline">
                              Gouden Schoen
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-3 sm:px-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: scorer.teamColor }}
                          />
                          <span className="truncate">{scorer.teamName}</span>
                        </div>
                      </td>

                      {/* Match Goals Summary */}
                      <td className="py-3 px-3 sm:px-4 text-slate-400 hidden md:table-cell text-xs">
                        {scorer.matchGoalsSummary && scorer.matchGoalsSummary.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {scorer.matchGoalsSummary.map((sum) => (
                              <span
                                key={sum.matchLabel}
                                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                              >
                                {sum.count}x in {sum.matchLabel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Goals Count */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-mono font-black text-sm ${
                            isGold
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-950 border border-slate-700 text-white'
                          }`}
                        >
                          ⚽ {scorer.goals}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
