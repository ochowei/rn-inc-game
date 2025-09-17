export interface Game {
  name: string;
  cost: number;
  productivity: number;
  creativity: number;
  timeToComplete: number; // in seconds
  income: number; // per 10 seconds
  maintenanceCost: number; // productivity per minute
}

export const producibleGames: Game[] = [
  {
    name: 'Novel Game',
    cost: 20,
    productivity: 10,
    creativity: 5,
    timeToComplete: 30,
    income: 1,
    maintenanceCost: 0.5,
  },
  {
    name: 'Puzzle Game',
    cost: 30,
    productivity: 15,
    creativity: 10,
    timeToComplete: 30,
    income: 1,
    maintenanceCost: 0.5,
  },
];
