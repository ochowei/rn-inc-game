import gameSettings from '../game_settings.json';

export interface GameProfile {
  resources: {
    creativity: number;
    productivity: number;
    money: number;
  };
  employees: {
    name: string;
    count: number;
  }[];
  games: any[]; // Replace 'any' with a proper type if you have one for games
  createdAt: string;
}

export const createNewGameProfile = (): GameProfile => {
  const { initial_resources } = gameSettings;

  return {
    resources: {
      creativity: initial_resources.creativity,
      productivity: initial_resources.productivity,
      money: initial_resources.funding,
    },
    employees: [
      {
        name: 'engineer',
        count: initial_resources.engineers,
      },
    ],
    games: [],
    createdAt: new Date().toISOString(),
  };
};
