import React from 'react';
import { Users, Shield, Edit2 } from 'lucide-react';
import { Team, UserRole } from '../types';

interface TeamsOverviewProps {
  teams: Team[];
  role: UserRole;
  onOpenEdit: () => void;
}

export const TeamsOverview: React.FC<TeamsOverviewProps> = ({
  teams,
  role,
  onOpenEdit,
}) => {
  const teamsA = teams.filter((t) => t.group === 'A');
  const teamsB = teams.filter((t) => t.group === 'B');

  const renderGroupList = (groupTeams: Team[], groupLetter: string) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 flex-1 shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          Groep {groupLetter}
        </h3>
        <span className="text-xs text-slate-400">4 Teams • 12 Spelers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {groupTeams.map((team, idx) => (
          <div
            key={team.id}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white/20 shadow"
                style={{ backgroundColor: team.color }}
              />
              <span className="font-bold text-sm text-white truncate">
                {team.name}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              {team.players.map((player, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500 font-mono w-3 text-right">
                    {pIdx + 1}.
                  </span>
                  <span className="text-slate-300 font-medium">{player}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="teams-overview-section" className="my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Deelnemende Teams & Spelers
          </h2>
          <p className="text-xs text-slate-400">
            8 teams • 3 spelers per team (3v3 toernooiopzet)
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={onOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Namen & Teams Bewerken</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderGroupList(teamsA, 'A')}
        {renderGroupList(teamsB, 'B')}
      </div>
    </section>
  );
};
