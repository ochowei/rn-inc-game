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

  const tickIntervalMs = gameSettings.game_tick_interval_sec * 1000;
  const flooredTimestamp =
    Math.floor(new Date().getTime() / tickIntervalMs) * tickIntervalMs;

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
    createdAt: new Date(flooredTimestamp).toISOString(),
  };
};

export const updateGameProfile = (
  currentProfile: GameProfile,
  elapsedMilliseconds: number
): GameProfile => {
  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  const ticks = Math.floor(
    elapsedMilliseconds / (gameSettings.game_tick_interval_sec * 1000)
  );

  if (ticks <= 0) {
    return newProfile;
  }

  // 1. Employee resource generation
  let totalCreativityPerTick = 0;
  let totalProductivityPerTick = 0;

  newProfile.employees.forEach((employee: { name: string; count: number }) => {
    const employeeSettings = (gameSettings as any)[employee.name];
    if (employeeSettings) {
      totalCreativityPerTick +=
        employee.count * employeeSettings.creativity_per_tick;
      totalProductivityPerTick +=
        employee.count * employeeSettings.productivity_per_tick;
    }
  });

  newProfile.resources.creativity = Math.min(
    newProfile.resources.creativity_max,
    newProfile.resources.creativity + totalCreativityPerTick * ticks
  );

  newProfile.resources.productivity = Math.min(
    newProfile.resources.productivity_max,
    newProfile.resources.productivity + totalProductivityPerTick * ticks
  );

  // 2. Game income and maintenance
  // TODO: need update
  let totalIncome = 0;
  let totalMaintenanceCost = 0;

  newProfile.games.forEach((game: any) => {
    const gameData = gameSettings.developable_games.find(
      (g) => g.name === game.name
    );
    if (gameData) {
      const incomePerTick =
        gameData.income_per_10_sec / (10 / gameSettings.game_tick_interval_sec);
      totalIncome += incomePerTick * ticks;

      const maintenancePerTick =
        gameData.maintenance_cost_per_min.productivity /
        (60 / gameSettings.game_tick_interval_sec);
      totalMaintenanceCost += maintenancePerTick * ticks;
    }
  });

  newProfile.resources.money += totalIncome;
  newProfile.resources.productivity = Math.max(
    0,
    newProfile.resources.productivity - totalMaintenanceCost
  );

  return newProfile;
};
