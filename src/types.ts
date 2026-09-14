export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: string[]; // exactly 3 players
  group: 'A' | 'B';
  color: string; // Tailwind color or hex for jersey/badge
  bgGradient: string;
  logoUrl?: string;
}

export type MatchStage = 'group' | 'semifinal' | 'third_place' | 'final';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface GoalEvent {
  id: string;
  teamId: string;
  playerName: string;
  minute?: number;
}

export interface Match {
  id: string;
  stage: MatchStage;
  group?: 'A' | 'B';
  matchNumber: number; // Order in schedule
  label: string; // e.g. "Groep A - Ronde 1", "Halve Finale 1", "Finale"
  homeTeamId: string | null; // null if waiting for qualification
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null; // for knockout ties
  awayPenalties?: number | null;
  status: MatchStatus;
  pitch: string; // e.g. "Veld 1"
  scheduledTime: string; // e.g. "10:00"
  goals?: GoalEvent[]; // doelpuntenmakers voor topscorersrangschikking
}

export interface TopscorerItem {
  rank: number;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  goals: number;
  matchGoalsSummary?: { matchLabel: string; count: number }[];
}

export interface TeamStanding {
  team: Team;
  played: number; // G gespeeld
  won: number; // W gewonnen
  drawn: number; // G gelijk
  lost: number; // V verloren
  goalsFor: number; // DV doelpunten voor
  goalsAgainst: number; // DT doelpunten tegen
  goalDifference: number; // DS doelsaldo
  points: number; // Ptn punten
  rank: number;
}

export type UserRole = 'admin' | 'spectator';

export interface FinalTournamentRankingItem {
  rank: number;
  team: Team | null;
  placeholder: string;
  status: 'confirmed' | 'in_progress' | 'pending';
  achievement: string;
  stageOrigin: string;
  points?: number;
  goalDiff?: number;
  goalsFor?: number;
}

export interface TournamentData {
  name: string;
  date: string;
  location: string;
  teams: Team[];
  matches: Match[];
  updatedAt: number;
}
