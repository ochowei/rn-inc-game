export interface Game {
  name: string;
  cost: number;
  productivity: number;
  creativity: number;
  timeToComplete: number; // in ticks
  income: number; // per tick
}

export const producibleGames: Game[] = [
  {
    name: 'Puzzle Game',
    cost: 30,
    productivity: 15,
    creativity: 10,
    timeToComplete: 6,
    income: 0.5,
  },
];
