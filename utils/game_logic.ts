import gameSettings from '../game_settings.json';

export interface GameProfile {
  resources: {
    creativity: number;
    productivity: number;
    creativity_max: number;
    productivity_max: number;
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
  const { initial_resources, engineer_level_1 } = gameSettings;

  return {
    resources: {
      creativity: 0, // Initial creativity
      productivity: 0, // Initial productivity
      creativity_max: engineer_level_1.creativity_max,
      productivity_max: engineer_level_1.productivity_max,
      money: initial_resources.money,
    },
    employees: [
      {
        name: 'engineer_level_1',
        count: initial_resources.employees.engineer_level_1,
      },
    ],
    games: [],
    createdAt: new Date().toISOString(),
  };
};
