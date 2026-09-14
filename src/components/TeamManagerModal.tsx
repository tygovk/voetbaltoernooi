import React, { useState } from 'react';
import {
  X,
  Users,
  Check,
  RotateCcw,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Team } from '../types';
import { DEFAULT_TEAMS } from '../data/defaultTournament';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onSaveTeams: (updatedTeams: Team[]) => void;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EAB308', // Yellow
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSaveTeams,
}) => {
  const [draftTeams, setDraftTeams] = useState<Team[]>(() => JSON.parse(JSON.stringify(teams)));
  const [selectedGroupTab, setSelectedGroupTab] = useState<'A' | 'B'>('A');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmDefault, setShowConfirmDefault] = useState(false);
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateTeamName = (teamId: string, name: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name } : t))
    );
  };

  const handleUpdatePlayer = (teamId: string, playerIndex: number, playerName: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const newPlayers = [...t.players];
        newPlayers[playerIndex] = playerName;
        return { ...t, players: newPlayers };
      })
    );
  };

  const handleUpdateColor = (teamId: string, color: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, color } : t))
    );
  };

  const handleSwitchGroup = (teamId: string, targetGroup: 'A' | 'B') => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, group: targetGroup } : t))
    );
  };

  const handleFileDrop = (teamId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Sleep een geldig afbeeldingsbestand (PNG, JPG, SVG, WebP) in het vak.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setDraftTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, logoUrl: dataUrl } : t))
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (teamId: string) => {
    setDraftTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, logoUrl: undefined } : t))
    );
  };

  const handleResetToDefault = () => {
    setDraftTeams(JSON.parse(JSON.stringify(DEFAULT_TEAMS)));
    setShowConfirmDefault(false);
    setErrorMessage(null);
  };

  const handleSave = () => {
    // Validation: Check that both groups have 4 teams
    const groupA = draftTeams.filter((t) => t.group === 'A');
    const groupB = draftTeams.filter((t) => t.group === 'B');

    if (groupA.length !== 4 || groupB.length !== 4) {
      setErrorMessage(`Elke poule moet exact 4 teams bevatten (Groep A: ${groupA.length}, Groep B: ${groupB.length}).`);
      return;
    }

    // Check for empty team names
    const emptyTeam = draftTeams.find((t) => !t.name.trim());
    if (emptyTeam) {
      setErrorMessage('Elk team moet een geldige naam hebben.');
      return;
    }

    // Check that every team has at least 3 players named
    const incompleteTeam = draftTeams.find(
      (t) => t.players.filter((p) => p.trim().length > 0).length < 3
    );
    if (incompleteTeam) {
      setErrorMessage(`Team "${incompleteTeam.name}" moet minimaal 3 spelersnamen hebben.`);
      return;
    }

    onSaveTeams(draftTeams);
    onClose();
  };

  const groupTeams = draftTeams.filter((t) => t.group === selectedGroupTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Teams & Spelers Beheren
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedGroupTab('A')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedGroupTab === 'A'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Groep A ({draftTeams.filter((t) => t.group === 'A').length}/4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroupTab('B')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedGroupTab === 'B'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Groep B ({draftTeams.filter((t) => t.group === 'B').length}/4)
            </button>
          </div>

          {showConfirmDefault ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300">Standaard herstellen?</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Ja
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDefault(false)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Nee
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmDefault(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Standaard Teams
            </button>
          )}
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-xs text-rose-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body: Teams List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl p-4 bg-slate-950/70 border border-slate-800 shadow-md space-y-3"
              >
                {/* Team Header & Color Picker */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-600 shrink-0"
                      />
                    ) : (
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: team.color }}
                      />
                    )}
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleUpdateTeamName(team.id, e.target.value)}
                      placeholder="Teamnaam"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Group switcher button */}
                  <button
                    type="button"
                    onClick={() => handleSwitchGroup(team.id, team.group === 'A' ? 'B' : 'A')}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Verplaats naar andere groep"
                  >
                    Naar Groep {team.group === 'A' ? 'B' : 'A'}
                  </button>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-slate-500 shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleUpdateColor(team.id, color)}
                        style={{ backgroundColor: color }}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          team.color === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Drag-and-drop Image / Logo Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTeamId(team.id);
                  }}
                  onDragLeave={() => setDragOverTeamId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTeamId(null);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileDrop(team.id, e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative p-2.5 rounded-lg border border-dashed text-center transition flex items-center justify-between gap-2 ${
                    dragOverTeamId === team.id
                      ? 'border-emerald-400 bg-emerald-950/40'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt="Logo"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="text-left text-[11px] truncate">
                      <span className="text-slate-300 font-medium block truncate">
                        {team.logoUrl ? 'Team logo actief' : 'Sleep afbeelding hierin'}
                      </span>
                      <span className="text-slate-500 text-[10px] block">
                        of klik om te kiezen (geen URL nodig)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <label className="cursor-pointer px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1">
                      <Upload className="w-3 h-3 text-emerald-400" />
                      <span>Kies</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileDrop(team.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {team.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(team.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="Logo verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Players Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    3 Spelers
                  </label>
                  {[0, 1, 2].map((pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 w-3 text-right">
                        {pIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={team.players[pIdx] || ''}
                        onChange={(e) => handleUpdatePlayer(team.id, pIdx, e.target.value)}
                        placeholder={`Speler ${pIdx + 1} naam`}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            Wijzigingen Opslaan
          </button>
        </div>

      </div>
    </div>
  );
};
