import gameSettings from '../game_settings.json';

export interface GameProfile {
  resources: {
    creativity: number;
    productivity: number;
    creativity_max: number;
    productivity_max: number;
    money: number;
    creativity_per_tick: number;
    productivity_per_tick: number;
    money_per_tick: number;
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
      creativity: 0,
      productivity: 0,
      creativity_max: engineer_level_1.creativity_max,
      productivity_max: engineer_level_1.productivity_max,
      money: initial_resources.money,
      creativity_per_tick: engineer_level_1.creativity_per_tick,
      productivity_per_tick: engineer_level_1.productivity_per_tick,
      money_per_tick: 0,
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
