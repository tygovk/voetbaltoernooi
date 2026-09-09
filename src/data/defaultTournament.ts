import { Match, Team, TournamentData } from '../types';

export const DEFAULT_TEAMS: Team[] = [
  // Groep A
  {
    id: 'team-1',
    name: 'De Straatstrijders',
    players: ['Liam de Jong', 'Sem Bakker', 'Noah Visser'],
    group: 'A',
    color: '#10B981', // Emerald
    bgGradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'team-2',
    name: 'FC Panna',
    players: ['Daan van Dijk', 'Lucas Smit', 'Finn de Boer'],
    group: 'A',
    color: '#3B82F6', // Blue
    bgGradient: 'from-blue-600 to-cyan-800',
  },
  {
    id: 'team-3',
    name: 'Oranje Helden',
    players: ['Bram Meijer', 'Milan Vos', 'Levi Bos'],
    group: 'A',
    color: '#F97316', // Orange
    bgGradient: 'from-orange-500 to-amber-700',
  },
  {
    id: 'team-4',
    name: 'Tiki-Taka Boys',
    players: ['Jesse Hendriks', 'Thijs Mulder', 'Luuk Brouwer'],
    group: 'A',
    color: '#EC4899', // Pink/Rose
    bgGradient: 'from-pink-600 to-rose-800',
  },

  // Groep B
  {
    id: 'team-5',
    name: 'De Doeltreffers',
    players: ['Lars de Wit', 'Sam Dekker', 'Max van Leeuwen'],
    group: 'B',
    color: '#8B5CF6', // Purple/Violet
    bgGradient: 'from-violet-600 to-purple-800',
  },
  {
    id: 'team-6',
    name: 'Koffie & Koek FC',
    players: ['Ruben Schouten', 'Stijn Kooijman', 'Mees Verhoeven'],
    group: 'B',
    color: '#EAB308', // Yellow/Gold
    bgGradient: 'from-amber-500 to-yellow-700',
  },
  {
    id: 'team-7',
    name: 'Veldheersers',
    players: ['Niek Jacobs', 'Sven van den Berg', 'Mats de Vries'],
    group: 'B',
    color: '#06B6D4', // Cyan
    bgGradient: 'from-cyan-600 to-sky-800',
  },
  {
    id: 'team-8',
    name: 'Rood-Wit Tornado',
    players: ['Casper Peters', 'Julian van Loon', 'Tom Willems'],
    group: 'B',
    color: '#EF4444', // Red
    bgGradient: 'from-red-600 to-rose-900',
  },
];

export function createInitialMatches(teams: Team[] = DEFAULT_TEAMS): Match[] {
  const groupATeams = teams.filter((t) => t.group === 'A');
  const groupBTeams = teams.filter((t) => t.group === 'B');

  const matches: Match[] = [];
  let matchNum = 1;

  // Helper for safe team ID access
  const a = (idx: number) => groupATeams[idx]?.id ?? null;
  const b = (idx: number) => groupBTeams[idx]?.id ?? null;

  // Round 1
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 1,
    label: 'Groep A - Ronde 1',
    homeTeamId: a(0),
    awayTeamId: a(1),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '10:00',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 2,
    label: 'Groep B - Ronde 1',
    homeTeamId: b(0),
    awayTeamId: b(1),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '10:00',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 3,
    label: 'Groep A - Ronde 1',
    homeTeamId: a(2),
    awayTeamId: a(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '10:20',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 4,
    label: 'Groep B - Ronde 1',
    homeTeamId: b(2),
    awayTeamId: b(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '10:20',
  });

  // Round 2
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 5,
    label: 'Groep A - Ronde 2',
    homeTeamId: a(0),
    awayTeamId: a(2),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '10:45',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 6,
    label: 'Groep B - Ronde 2',
    homeTeamId: b(0),
    awayTeamId: b(2),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '10:45',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 7,
    label: 'Groep A - Ronde 2',
    homeTeamId: a(1),
    awayTeamId: a(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '11:05',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 8,
    label: 'Groep B - Ronde 2',
    homeTeamId: b(1),
    awayTeamId: b(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '11:05',
  });

  // Round 3
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 9,
    label: 'Groep A - Ronde 3',
    homeTeamId: a(0),
    awayTeamId: a(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '11:30',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 10,
    label: 'Groep B - Ronde 3',
    homeTeamId: b(0),
    awayTeamId: b(3),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '11:30',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'A',
    matchNumber: 11,
    label: 'Groep A - Ronde 3',
    homeTeamId: a(1),
    awayTeamId: a(2),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '11:50',
  });
  matches.push({
    id: `match-${matchNum++}`,
    stage: 'group',
    group: 'B',
    matchNumber: 12,
    label: 'Groep B - Ronde 3',
    homeTeamId: b(1),
    awayTeamId: b(2),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '11:50',
  });

  // Knockouts
  // Semifinal 1: A1 vs B2
  matches.push({
    id: 'match-semi-1',
    stage: 'semifinal',
    matchNumber: 13,
    label: 'Halve Finale 1 (A1 vs B2)',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 1',
    scheduledTime: '12:20',
  });

  // Semifinal 2: B1 vs A2
  matches.push({
    id: 'match-semi-2',
    stage: 'semifinal',
    matchNumber: 14,
    label: 'Halve Finale 2 (B1 vs A2)',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '12:20',
  });

  // 3rd Place match (Troostfinale)
  matches.push({
    id: 'match-third',
    stage: 'third_place',
    matchNumber: 15,
    label: 'Troostfinale (3e & 4e plaats)',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Veld 2',
    scheduledTime: '12:50',
  });

  // Grand Final
  matches.push({
    id: 'match-final',
    stage: 'final',
    matchNumber: 16,
    label: 'Grote Finale',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    pitch: 'Hoofdveld (Veld 1)',
    scheduledTime: '13:15',
  });

  return matches;
}

export function getDefaultTournament(): TournamentData {
  return {
    name: 'Zomertoernooi 3v3 Kampioenschap',
    date: 'Zaterdag 13 September 2025',
    location: 'Sportpark De Groene Weide',
    teams: DEFAULT_TEAMS,
    matches: createInitialMatches(DEFAULT_TEAMS),
    updatedAt: Date.now(),
  };
}

export function getSampleTournamentWithResults(): TournamentData {
  const base = getDefaultTournament();
  // Sample scores for group phase
  const groupScores: Record<string, [number, number]> = {
    'match-1': [3, 1], // A1 vs A2
    'match-2': [2, 2], // B1 vs B2
    'match-3': [1, 4], // A3 vs A4
    'match-4': [0, 3], // B3 vs B4
    'match-5': [2, 0], // A1 vs A3
    'match-6': [4, 1], // B1 vs B3
    'match-7': [3, 2], // A2 vs A4
    'match-8': [1, 2], // B2 vs B4
    'match-9': [2, 1], // A1 vs A4
    'match-10': [3, 1], // B1 vs B4
    'match-11': [1, 1], // A2 vs A3
    'match-12': [2, 0], // B2 vs B3
  };

  const updatedMatches = base.matches.map((m) => {
    if (groupScores[m.id]) {
      const [h, a] = groupScores[m.id];
      return {
        ...m,
        homeScore: h,
        awayScore: a,
        status: 'finished' as const,
      };
    }
    return m;
  });

  return {
    ...base,
    matches: updatedMatches,
    updatedAt: Date.now(),
  };
}

