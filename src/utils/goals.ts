import { GoalEvent } from '../types';

/**
 * Returns the running score string at the time this goal occurred (e.g. "1-0", "1-3").
 * If the goal already has `scoreDisplay`, that is preferred.
 * Otherwise, it calculates the running score from the order of goals in `allGoals`.
 */
export function getGoalScoreDisplay(
  goal: GoalEvent,
  allGoals?: GoalEvent[] | null,
  homeTeamId?: string | null
): string {
  if (goal.scoreDisplay) {
    return goal.scoreDisplay;
  }
  if (!allGoals || allGoals.length === 0 || !homeTeamId) {
    return '';
  }

  const idx = allGoals.findIndex((g) => g.id === goal.id);
  if (idx === -1) return '';

  let h = 0;
  let a = 0;
  for (let i = 0; i <= idx; i++) {
    if (allGoals[i].teamId === homeTeamId) {
      h++;
    } else {
      a++;
    }
  }
  return `${h}-${a}`;
}

/**
 * Recalculates `scoreDisplay` for all goals in an array in order.
 */
export function enrichGoalsWithScores(
  goals: GoalEvent[],
  homeTeamId: string | null
): GoalEvent[] {
  let h = 0;
  let a = 0;
  return goals.map((goal) => {
    if (goal.teamId === homeTeamId) {
      h++;
    } else {
      a++;
    }
    return {
      ...goal,
      scoreDisplay: `${h}-${a}`,
      homeScoreAtGoal: h,
      awayScoreAtGoal: a,
    };
  });
}
