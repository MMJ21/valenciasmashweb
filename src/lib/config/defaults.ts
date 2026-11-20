export const APP_DEFAULTS = {
  pm: {
    maxWager: 1000,
    matchmakingWager: 100,
    maxPlannedPerDay: 5,
    proposalTtlHours: 48,
    reportTtlDays: 7,
    minSetsDuelist: 5,
    matchmakingQueueTtlHours: 24,
    matchmakingRepeatPerWeek: 1,
  },
  elo: { initial: 1000, k: 32 },
  ranking: { activeAlgorithm: "elo", minTournaments: 1 },
} as const;
