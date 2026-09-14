import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Flame,
  Filter,
  Edit2,
  Users,
} from 'lucide-react';
import { Match, Team, UserRole } from '../types';
import { sounds } from '../utils/audio';

interface GroupMatchesProps {
  matches: Match[];
  teams: Team[];
  role: UserRole;
  onUpdateScore: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status?: Match['status']
  ) => void;
  onSelectMatch: (match: Match) => void;
}

export const GroupMatches: React.FC<GroupMatchesProps> = ({
  matches,
  teams,
  role,
  onUpdateScore,
  onSelectMatch,
}) => {
  const [filterGroup, setFilterGroup] = useState<'all' | 'A' | 'B'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unplayed' | 'finished'>('all');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Temporary scores during inline edit
  const [tempHome, setTempHome] = useState<number>(0);
  const [tempAway, setTempAway] = useState<number>(0);

  const groupMatches = matches.filter((m) => m.stage === 'group');

  const filteredMatches = groupMatches.filter((m) => {
    if (filterGroup !== 'all' && m.group !== filterGroup) return false;
    if (filterStatus === 'unplayed' && (m.homeScore !== null && m.awayScore !== null)) return false;
    if (filterStatus === 'finished' && (m.homeScore === null || m.awayScore === null)) return false;
    return true;
  });

  const getTeam = (id: string | null) => teams.find((t) => t.id === id);

  const startEdit = (match: Match) => {
    setEditingMatchId(match.id);
    setTempHome(match.homeScore ?? 0);
    setTempAway(match.awayScore ?? 0);
  };

  const saveEdit = (matchId: string) => {
    sounds.playGoal();
    onUpdateScore(matchId, tempHome, tempAway, 'finished');
    setEditingMatchId(null);
  };

  const cancelEdit = () => {
    setEditingMatchId(null);
  };

  const clearScore = (matchId: string) => {
    onUpdateScore(matchId, null, null, 'scheduled');
    setEditingMatchId(null);
  };

  return (
    <section id="group-matches-section" className="my-6">
      {/* Section Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            Groepswedstrijden
          </h2>
          <p className="text-xs text-slate-400">
            {role === 'admin'
              ? 'Voer scores in of klik op een wedstrijd om direct te bewerken'
              : 'Overzicht van alle poulewedstrijden en uitslagen'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterGroup('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterGroup === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alles
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup('A')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterGroup === 'A'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Groep A
            </button>
            <button
              type="button"
              onClick={() => setFilterGroup('B')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterGroup === 'B'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Groep B
            </button>
          </div>

          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alle statussen
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unplayed')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterStatus === 'unplayed'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Te spelen
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('finished')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filterStatus === 'finished'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gespeeld
            </button>
          </div>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredMatches.map((match) => {
          const home = getTeam(match.homeTeamId);
          const away = getTeam(match.awayTeamId);
          const isFinished = match.homeScore !== null && match.awayScore !== null;
          const isEditing = editingMatchId === match.id;
          const isLive = match.status === 'live';

          return (
            <div
              key={match.id}
              className={`relative rounded-xl p-4 border transition-all ${
                isLive
                  ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/50 shadow-lg'
                  : isFinished
                  ? 'bg-slate-900/60 border-slate-800/90'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top metadata line */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-400">
                    {match.label}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {match.scheduledTime}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {match.pitch}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      <Flame className="w-2.5 h-2.5" /> LIVE
                    </span>
                  ) : isFinished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Gespeeld
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Gepland</span>
                  )}

                  {role === 'admin' && !isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(match)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                      title="Uitslag invoeren / wijzigen"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Teams & Score Row */}
              <div className="grid grid-cols-12 items-center gap-2">
                {/* Home Team */}
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: home?.color || '#64748b' }}
                  />
                  <div className="min-w-0">
                    <div
                      className={`truncate font-semibold text-sm ${
                        isFinished && match.homeScore! > match.awayScore!
                          ? 'text-emerald-300 font-bold'
                          : 'text-white'
                      }`}
                    >
                      {home?.name || 'Onbekend'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {home?.players.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Score or VS */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={tempHome}
                        onChange={(e) => setTempHome(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-7 h-7 text-center font-bold text-xs bg-slate-950 border border-emerald-500/50 rounded text-white"
                      />
                      <span className="text-slate-500 font-mono text-xs">:</span>
                      <input
                        type="number"
                        min="0"
                        value={tempAway}
                        onChange={(e) => setTempAway(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-7 h-7 text-center font-bold text-xs bg-slate-950 border border-emerald-500/50 rounded text-white"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectMatch(match)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-sm tracking-wider transition ${
                        isLive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50 animate-pulse border border-rose-400'
                          : isFinished
                          ? 'bg-slate-950 text-white border border-slate-800 hover:border-emerald-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                      title={isLive ? 'Live wedstrijd - klik voor details' : 'Klik om in Volgende Wedstrijd highlight te tonen'}
                    >
                      {isLive || isFinished
                        ? `${match.homeScore !== null ? match.homeScore : 0} - ${match.awayScore !== null ? match.awayScore : 0}`
                        : 'vs'}
                    </button>
                  )}
                </div>

                {/* Away Team */}
                <div className="col-span-5 flex items-center justify-end gap-2 min-w-0 text-right">
                  <div className="min-w-0">
                    <div
                      className={`truncate font-semibold text-sm ${
                        isFinished && match.awayScore! > match.homeScore!
                          ? 'text-emerald-300 font-bold'
                          : 'text-white'
                      }`}
                    >
                      {away?.name || 'Onbekend'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {away?.players.join(', ')}
                    </div>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: away?.color || '#64748b' }}
                  />
                </div>
              </div>

              {/* Goalscorers Row (Visible for spectators and admins) */}
              {match.goals && match.goals.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                  {/* Home goals */}
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {match.goals
                      .filter((g) => g.teamId === match.homeTeamId)
                      .map((g) => (
                        <span
                          key={g.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-emerald-800/40 text-emerald-300 font-medium text-[10px]"
                        >
                          <span>⚽</span>
                          <span>{g.playerName}</span>
                        </span>
                      ))}
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 font-bold">⚽</span>

                  {/* Away goals */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end min-w-0 text-right">
                    {match.goals
                      .filter((g) => g.teamId === match.awayTeamId)
                      .map((g) => (
                        <span
                          key={g.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-emerald-800/40 text-emerald-300 font-medium text-[10px]"
                        >
                          <span>⚽</span>
                          <span>{g.playerName}</span>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Inline Edit Action Buttons for Admin */}
              {isEditing && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTempHome(tempHome + 1)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-200 hover:bg-slate-700"
                    >
                      +1 {home?.name.split(' ')[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempAway(tempAway + 1)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-200 hover:bg-slate-700"
                    >
                      +1 {away?.name.split(' ')[0]}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Annuleer
                    </button>
                    {isFinished && (
                      <button
                        type="button"
                        onClick={() => clearScore(match.id)}
                        className="px-2 py-1 rounded text-xs text-rose-400 hover:bg-rose-950/40"
                      >
                        Wissen
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => saveEdit(match.id)}
                      className="px-3 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                    >
                      Opslaan
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
