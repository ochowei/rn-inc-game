export interface Game {
  name: string;
  cost: number;
  productivity: number;
  creativity: number;
  timeToComplete: number; // in seconds
  income: number; // per 10 seconds
}

export const producibleGames: Game[] = [
  {
    name: 'mini puzzle game',
    cost: 20,
    productivity: 10,
    creativity: 10,
    timeToComplete: 30,
    income: 1,
  },
];
