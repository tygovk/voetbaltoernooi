import { Match, Team, TeamStanding, FinalTournamentRankingItem } from '../types';

/**
 * Calculates standings for a specific group according to official tournament rules:
 * 1. Punten (3 voor winst, 1 voor gelijkspel, 0 voor verlies)
 * 2. Doelsaldo (DV - DT)
 * 3. Doelpunten voor (DV)
 * 4. Onderling resultaat (Head-to-Head)
 * 5. Alfabetisch
 */
export function calculateGroupStandings(
  teams: Team[],
  matches: Match[],
  group: 'A' | 'B'
): TeamStanding[] {
  const groupTeams = teams.filter((t) => t.group === group);
  const groupMatches = matches.filter(
    (m) => m.stage === 'group' && m.group === group
  );

  const statsMap = new Map<string, Omit<TeamStanding, 'rank'>>();

  groupTeams.forEach((team) => {
    statsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  groupMatches.forEach((match) => {
    if (
      match.homeTeamId &&
      match.awayTeamId &&
      match.homeScore !== null &&
      match.awayScore !== null
    ) {
      const homeStats = statsMap.get(match.homeTeamId);
      const awayStats = statsMap.get(match.awayTeamId);

      if (homeStats && awayStats) {
        homeStats.played += 1;
        awayStats.played += 1;

        homeStats.goalsFor += match.homeScore;
        homeStats.goalsAgainst += match.awayScore;
        awayStats.goalsFor += match.awayScore;
        awayStats.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          homeStats.won += 1;
          homeStats.points += 3;
          awayStats.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          awayStats.won += 1;
          awayStats.points += 3;
          homeStats.lost += 1;
        } else {
          homeStats.drawn += 1;
          homeStats.points += 1;
          awayStats.drawn += 1;
          awayStats.points += 1;
        }

        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;
      }
    }
  });

  const standingsList = Array.from(statsMap.values());

  // Sort according to functional specification:
  // 1. Punten
  // 2. Doelsaldo
  // 3. Doelpunten voor
  standingsList.sort((a, b) => {
    // 1. Punten
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // 2. Doelsaldo
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    // 3. Doelpunten voor
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // Tie-breaker: Head-to-Head between a and b
    const h2h = groupMatches.find(
      (m) =>
        (m.homeTeamId === a.team.id && m.awayTeamId === b.team.id) ||
        (m.homeTeamId === b.team.id && m.awayTeamId === a.team.id)
    );
    if (h2h && h2h.homeScore !== null && h2h.awayScore !== null) {
      const aScore = h2h.homeTeamId === a.team.id ? h2h.homeScore : h2h.awayScore;
      const bScore = h2h.homeTeamId === b.team.id ? h2h.homeScore : h2h.awayScore;
      if (aScore !== bScore) {
        return bScore - aScore;
      }
    }

    // Alphabetical fallback
    return a.team.name.localeCompare(b.team.name);
  });

  return standingsList.map((st, index) => ({
    ...st,
    rank: index + 1,
  }));
}

/**
 * Checks if all group matches for both groups are finished.
 */
export function areAllGroupMatchesFinished(matches: Match[]): boolean {
  const groupMatches = matches.filter((m) => m.stage === 'group');
  if (groupMatches.length === 0) return false;
  return groupMatches.every(
    (m) => m.homeScore !== null && m.awayScore !== null
  );
}

/**
 * Returns match winner ID and loser ID, handling extra penalties if needed.
 */
export function getKnockoutResult(match: Match): {
  winnerId: string | null;
  loserId: string | null;
  isDrawAwaitingPenalties: boolean;
} {
  if (
    !match.homeTeamId ||
    !match.awayTeamId ||
    match.homeScore === null ||
    match.awayScore === null
  ) {
    return { winnerId: null, loserId: null, isDrawAwaitingPenalties: false };
  }

  if (match.homeScore > match.awayScore) {
    return { winnerId: match.homeTeamId, loserId: match.awayTeamId, isDrawAwaitingPenalties: false };
  }
  if (match.awayScore > match.homeScore) {
    return { winnerId: match.awayTeamId, loserId: match.homeTeamId, isDrawAwaitingPenalties: false };
  }

  // Tied regular score
  if (
    match.homePenalties !== null &&
    match.awayPenalties !== null &&
    match.homePenalties !== undefined &&
    match.awayPenalties !== undefined
  ) {
    if (match.homePenalties > match.awayPenalties) {
      return { winnerId: match.homeTeamId, loserId: match.awayTeamId, isDrawAwaitingPenalties: false };
    }
    if (match.awayPenalties > match.homePenalties) {
      return { winnerId: match.awayTeamId, loserId: match.homeTeamId, isDrawAwaitingPenalties: false };
    }
  }

  // Drawn and no decided penalties yet
  return { winnerId: null, loserId: null, isDrawAwaitingPenalties: true };
}

/**
 * Synchronizes knockout matches with group phase rankings and semifinal outcomes.
 * Rule:
 * Halve Finale 1: A1 vs B2
 * Halve Finale 2: B1 vs A2
 * Grote Finale: Winnaar HF1 vs Winnaar HF2
 * Troostfinale: Verliezer HF1 vs Verliezer HF2
 */
export function synchronizeKnockoutMatches(
  matches: Match[],
  teams: Team[]
): Match[] {
  const standingsA = calculateGroupStandings(teams, matches, 'A');
  const standingsB = calculateGroupStandings(teams, matches, 'B');

  const a1 = standingsA[0]?.team?.id ?? null;
  const a2 = standingsA[1]?.team?.id ?? null;
  const b1 = standingsB[0]?.team?.id ?? null;
  const b2 = standingsB[1]?.team?.id ?? null;

  // We can project knockout teams when at least teams are present
  // If groups are not fully done, we still preview or populate once matches start
  const updatedMatches = matches.map((match) => {
    if (match.id === 'match-semi-1') {
      const changed = match.homeTeamId !== a1 || match.awayTeamId !== b2;
      return {
        ...match,
        homeTeamId: a1,
        awayTeamId: b2,
        // Reset scores if teams changed
        ...(changed ? { homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null } : {}),
      };
    }
    if (match.id === 'match-semi-2') {
      const changed = match.homeTeamId !== b1 || match.awayTeamId !== a2;
      return {
        ...match,
        homeTeamId: b1,
        awayTeamId: a2,
        ...(changed ? { homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null } : {}),
      };
    }
    return match;
  });

  // Now resolve Semifinals for Final and 3rd place
  const semi1 = updatedMatches.find((m) => m.id === 'match-semi-1');
  const semi2 = updatedMatches.find((m) => m.id === 'match-semi-2');

  const semi1Result = semi1 ? getKnockoutResult(semi1) : { winnerId: null, loserId: null };
  const semi2Result = semi2 ? getKnockoutResult(semi2) : { winnerId: null, loserId: null };

  const finalWinnerHome = semi1Result.winnerId;
  const finalWinnerAway = semi2Result.winnerId;
  const thirdLoserHome = semi1Result.loserId;
  const thirdLoserAway = semi2Result.loserId;

  return updatedMatches.map((match) => {
    if (match.id === 'match-final') {
      const changed = match.homeTeamId !== finalWinnerHome || match.awayTeamId !== finalWinnerAway;
      return {
        ...match,
        homeTeamId: finalWinnerHome,
        awayTeamId: finalWinnerAway,
        ...(changed ? { homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null } : {}),
      };
    }
    if (match.id === 'match-third') {
      const changed = match.homeTeamId !== thirdLoserHome || match.awayTeamId !== thirdLoserAway;
      return {
        ...match,
        homeTeamId: thirdLoserHome,
        awayTeamId: thirdLoserAway,
        ...(changed ? { homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null } : {}),
      };
    }
    return match;
  });
}

/**
 * Finds the currently active (live) or next upcoming match.
 */
export function getNextOrLiveMatch(matches: Match[]): Match | null {
  // 1. Live match first
  const live = matches.find((m) => m.status === 'live');
  if (live) return live;

  // 2. Next unplayed match that has both teams decided
  const nextPlayable = matches.find(
    (m) =>
      m.homeTeamId !== null &&
      m.awayTeamId !== null &&
      (m.homeScore === null || m.awayScore === null)
  );
  if (nextPlayable) return nextPlayable;

  // 3. Fallback: last finished match or null
  return null;
}

/**
 * Calculates the complete final rankings (Eindrangschikking 1e t/m 8e plaats)
 * - 1e Plaats: Winnaar Grote Finale (Kampioen 🏆)
 * - 2e Plaats: Verliezer Grote Finale (Zilver 🥈)
 * - 3e Plaats: Winnaar Troostfinale (Brons 🥉)
 * - 4e Plaats: Verliezer Troostfinale
 * - 5e t/m 8e Plaats: Teams uit de poulefase gerangschikt op punten en doelsaldo
 */
export function calculateTournamentFinalRankings(
  teams: Team[],
  matches: Match[]
): FinalTournamentRankingItem[] {
  const standingsA = calculateGroupStandings(teams, matches, 'A');
  const standingsB = calculateGroupStandings(teams, matches, 'B');
  const allGroupsDone = areAllGroupMatchesFinished(matches);

  const semi1 = matches.find((m) => m.id === 'match-semi-1');
  const semi2 = matches.find((m) => m.id === 'match-semi-2');
  const finalMatch = matches.find((m) => m.id === 'match-final');
  const thirdMatch = matches.find((m) => m.id === 'match-third');

  const semi1Result = semi1 ? getKnockoutResult(semi1) : { winnerId: null, loserId: null };
  const semi2Result = semi2 ? getKnockoutResult(semi2) : { winnerId: null, loserId: null };

  const finalResult = finalMatch ? getKnockoutResult(finalMatch) : { winnerId: null, loserId: null };
  const thirdResult = thirdMatch ? getKnockoutResult(thirdMatch) : { winnerId: null, loserId: null };

  const getTeamById = (id: string | null): Team | null => (id ? teams.find((t) => t.id === id) || null : null);

  // 1st: Champion
  const champion = getTeamById(finalResult.winnerId);
  // 2nd: Runner-up
  const runnerUp = getTeamById(finalResult.loserId);
  // 3rd: Winner of Troostfinale
  const thirdPlace = getTeamById(thirdResult.winnerId);
  // 4th: Loser of Troostfinale
  const fourthPlace = getTeamById(thirdResult.loserId);

  // Group 3rd and 4th place teams
  const thirdA = standingsA[2];
  const thirdB = standingsB[2];
  const fourthA = standingsA[3];
  const fourthB = standingsB[3];

  const compareStandings = (s1?: TeamStanding, s2?: TeamStanding) => {
    if (!s1 && !s2) return 0;
    if (!s1) return 1;
    if (!s2) return -1;
    if (s2.points !== s1.points) return s2.points - s1.points;
    if (s2.goalDifference !== s1.goalDifference) return s2.goalDifference - s1.goalDifference;
    if (s2.goalsFor !== s1.goalsFor) return s2.goalsFor - s1.goalsFor;
    return s1.team.name.localeCompare(s2.team.name);
  };

  const thirdPool = [thirdA, thirdB].filter(Boolean).sort(compareStandings);
  const fourthPool = [fourthA, fourthB].filter(Boolean).sort(compareStandings);

  const fifth = thirdPool[0];
  const sixth = thirdPool[1];
  const seventh = fourthPool[0];
  const eighth = fourthPool[1];

  const rankings: FinalTournamentRankingItem[] = [
    {
      rank: 1,
      team: champion,
      placeholder:
        finalMatch?.homeTeamId && finalMatch?.awayTeamId
          ? `${getTeamById(finalMatch.homeTeamId)?.name} of ${getTeamById(finalMatch.awayTeamId)?.name}`
          : 'Winnaar Grote Finale',
      status: champion ? 'confirmed' : finalMatch?.homeTeamId && finalMatch?.awayTeamId ? 'in_progress' : 'pending',
      achievement: 'Toernooikampioen 🏆',
      stageOrigin: 'Grote Finale • Goud',
    },
    {
      rank: 2,
      team: runnerUp,
      placeholder:
        finalMatch?.homeTeamId && finalMatch?.awayTeamId
          ? `${getTeamById(finalMatch.homeTeamId)?.name} of ${getTeamById(finalMatch.awayTeamId)?.name}`
          : 'Verliezer Grote Finale',
      status: runnerUp ? 'confirmed' : finalMatch?.homeTeamId && finalMatch?.awayTeamId ? 'in_progress' : 'pending',
      achievement: '2e Plaats (Zilver) 🥈',
      stageOrigin: 'Finalist • Zilver',
    },
    {
      rank: 3,
      team: thirdPlace,
      placeholder:
        thirdMatch?.homeTeamId && thirdMatch?.awayTeamId
          ? `${getTeamById(thirdMatch.homeTeamId)?.name} of ${getTeamById(thirdMatch.awayTeamId)?.name}`
          : semi1Result.loserId && !semi2Result.loserId
          ? `${getTeamById(semi1Result.loserId)?.name} of Verliezer HF2`
          : !semi1Result.loserId && semi2Result.loserId
          ? `Verliezer HF1 of ${getTeamById(semi2Result.loserId)?.name}`
          : 'Winnaar Troostfinale (Verliezers HF)',
      status: thirdPlace ? 'confirmed' : thirdMatch?.homeTeamId && thirdMatch?.awayTeamId ? 'in_progress' : 'pending',
      achievement: '3e Plaats (Brons) 🥉',
      stageOrigin: 'Winnaar Troostfinale • Brons',
    },
    {
      rank: 4,
      team: fourthPlace,
      placeholder:
        thirdMatch?.homeTeamId && thirdMatch?.awayTeamId
          ? `${getTeamById(thirdMatch.homeTeamId)?.name} of ${getTeamById(thirdMatch.awayTeamId)?.name}`
          : 'Verliezer Troostfinale',
      status: fourthPlace ? 'confirmed' : thirdMatch?.homeTeamId && thirdMatch?.awayTeamId ? 'in_progress' : 'pending',
      achievement: '4e Plaats',
      stageOrigin: 'Verliezer Troostfinale',
    },
    {
      rank: 5,
      team: fifth?.team || null,
      placeholder: 'Beste nummer 3 uit poulefase',
      status: allGroupsDone ? 'confirmed' : 'in_progress',
      achievement: '5e Plaats',
      stageOrigin: fifth
        ? `3e Groep ${fifth.team.group} (${fifth.points} pnt, DS ${fifth.goalDifference > 0 ? '+' : ''}${fifth.goalDifference})`
        : '3e in Poule',
      points: fifth?.points,
      goalDiff: fifth?.goalDifference,
      goalsFor: fifth?.goalsFor,
    },
    {
      rank: 6,
      team: sixth?.team || null,
      placeholder: 'Tweede nummer 3 uit poulefase',
      status: allGroupsDone ? 'confirmed' : 'in_progress',
      achievement: '6e Plaats',
      stageOrigin: sixth
        ? `3e Groep ${sixth.team.group} (${sixth.points} pnt, DS ${sixth.goalDifference > 0 ? '+' : ''}${sixth.goalDifference})`
        : '3e in Poule',
      points: sixth?.points,
      goalDiff: sixth?.goalDifference,
      goalsFor: sixth?.goalsFor,
    },
    {
      rank: 7,
      team: seventh?.team || null,
      placeholder: 'Beste nummer 4 uit poulefase',
      status: allGroupsDone ? 'confirmed' : 'in_progress',
      achievement: '7e Plaats',
      stageOrigin: seventh
        ? `4e Groep ${seventh.team.group} (${seventh.points} pnt, DS ${seventh.goalDifference > 0 ? '+' : ''}${seventh.goalDifference})`
        : '4e in Poule',
      points: seventh?.points,
      goalDiff: seventh?.goalDifference,
      goalsFor: seventh?.goalsFor,
    },
    {
      rank: 8,
      team: eighth?.team || null,
      placeholder: 'Tweede nummer 4 uit poulefase',
      status: allGroupsDone ? 'confirmed' : 'in_progress',
      achievement: '8e Plaats',
      stageOrigin: eighth
        ? `4e Groep ${eighth.team.group} (${eighth.points} pnt, DS ${eighth.goalDifference > 0 ? '+' : ''}${eighth.goalDifference})`
        : '4e in Poule',
      points: eighth?.points,
      goalDiff: eighth?.goalDifference,
      goalsFor: eighth?.goalsFor,
    },
  ];

  return rankings;
}
