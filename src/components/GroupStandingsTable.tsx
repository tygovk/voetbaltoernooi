import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Check, Users } from 'lucide-react';
import { TeamStanding } from '../types';

interface GroupStandingsTableProps {
  standingsA: TeamStanding[];
  standingsB: TeamStanding[];
  activeGroupTab?: 'all' | 'A' | 'B';
}

export const GroupStandingsTable: React.FC<GroupStandingsTableProps> = ({
  standingsA,
  standingsB,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'both' | 'A' | 'B'>('both');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleTeam = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const renderSingleTable = (standings: TeamStanding[], groupName: string) => {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-xl flex-1">
        {/* Table Header / Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Stand {groupName}
            </h3>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            Top 2 naar Halve Finale
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pl-3 pr-1 text-center w-8">#</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-2 text-center" title="Gespeeld">G</th>
                <th className="py-2.5 px-2 text-center" title="Gewonnen">W</th>
                <th className="py-2.5 px-2 text-center" title="Gelijk">G</th>
                <th className="py-2.5 px-2 text-center" title="Verloren">V</th>
                <th className="py-2.5 px-2 text-center" title="Doelpunten Voor">DV</th>
                <th className="py-2.5 px-2 text-center" title="Doelpunten Tegen">DT</th>
                <th className="py-2.5 px-2 text-center font-bold" title="Doelsaldo">+/-</th>
                <th className="py-2.5 pr-3 pl-2 text-center font-black text-emerald-400" title="Punten">Ptn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.map((st) => {
                const isQualified = st.rank <= 2;
                const isExpanded = expandedTeamId === st.team.id;

                return (
                  <React.Fragment key={st.team.id}>
                    <tr
                      onClick={() => toggleTeam(st.team.id)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/40 ${
                        isQualified
                          ? 'bg-emerald-950/20 text-white font-medium'
                          : 'text-slate-300'
                      }`}
                    >
                      {/* Rank with qualification bar */}
                      <td className="py-3 pl-3 pr-1 text-center font-mono">
                        <div className="flex items-center justify-center gap-1">
                          {isQualified ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                              {st.rank}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">{st.rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Team Name and Color */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: st.team.color }}
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {st.team.name}
                              {isQualified && (
                                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {groupName === 'Groep A' ? `A${st.rank}` : `B${st.rank}`}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 sm:hidden">
                              <span>3 spelers</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3 px-2 text-center font-mono text-slate-300">
                        {st.played}
                      </td>

                      {/* Won */}
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {st.won}
                      </td>

                      {/* Drawn */}
                      <td className="py-3 px-2 text-center font-mono text-slate-400">
                        {st.drawn}
                      </td>

                      {/* Lost */}
                      <td className="py-3 px-2 text-center font-mono text-rose-400">
                        {st.lost}
                      </td>

                      {/* Goals For */}
                      <td className="py-3 px-2 text-center font-mono text-slate-300">
                        {st.goalsFor}
                      </td>

                      {/* Goals Against */}
                      <td className="py-3 px-2 text-center font-mono text-slate-400">
                        {st.goalsAgainst}
                      </td>

                      {/* Goal Difference */}
                      <td
                        className={`py-3 px-2 text-center font-mono font-bold ${
                          st.goalDifference > 0
                            ? 'text-emerald-400'
                            : st.goalDifference < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {st.goalDifference > 0 ? `+${st.goalDifference}` : st.goalDifference}
                      </td>

                      {/* Points */}
                      <td className="py-3 pr-3 pl-2 text-center font-mono font-extrabold text-sm text-emerald-400">
                        {st.points}
                      </td>
                    </tr>

                    {/* Expandable Player List Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80 text-[11px] border-b border-slate-800">
                        <td colSpan={10} className="py-2 px-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-slate-400">Spelers (3-tal):</span>
                            <span className="font-medium text-white">
                              {st.team.players.join(', ')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer explanation */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Plaats 1 & 2 gaan naar Halve Finales</span>
          </div>
          <span className="hidden sm:inline text-slate-500">
            Sorteerregel: 1. Punten 2. Doelsaldo 3. Doelpunten voor
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="group-standings-section" className="my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            Groepstanden
          </h2>
          <p className="text-xs text-slate-400">
            Wordt direct en automatisch bijgewerkt bij elke ingevoerde uitslag
          </p>
        </div>

        {/* Group Selector for Mobile or Filter */}
        <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedGroup('both')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              selectedGroup === 'both'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Beide Groepen
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroup('A')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              selectedGroup === 'A'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Groep A
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroup('B')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              selectedGroup === 'B'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Groep B
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(selectedGroup === 'both' || selectedGroup === 'A') &&
          renderSingleTable(standingsA, 'Groep A')}
        {(selectedGroup === 'both' || selectedGroup === 'B') &&
          renderSingleTable(standingsB, 'Groep B')}
      </div>
    </section>
  );
};
