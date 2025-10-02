import { GameSettings, Game, SaveProfile, ResourceGroup } from './types';

export const createNewSaveProfile = (settings: GameSettings): SaveProfile => {
  const { initial, engineer_level_1 } = settings;

  return {
    resources: {
      current: {
        resource_1: initial.resources.resource_1,
        resource_2: initial.resources.resource_2,
        resource_3: initial.resources.resource_3,
      },
      max: {
        resource_1: engineer_level_1.resource_max.resource_1,
        resource_2: engineer_level_1.resource_max.resource_2,
        resource_3: engineer_level_1.resource_max.resource_3,
      },
      per_tick: {
        resource_1: engineer_level_1.resource_per_tick.resource_1,
        resource_2: engineer_level_1.resource_per_tick.resource_2,
        resource_3: engineer_level_1.resource_per_tick.resource_3,
      },
    },
    employees: [
      {
        name: 'engineer_level_1',
        count: initial.assets.engineer_level_1,
      },
    ],
    games: [],
    createdAt: new Date().toISOString(),
  };
};

export const updateSaveProfile = (
  currentProfile: SaveProfile,
  ticks: number,
  settings: GameSettings
): SaveProfile => {
  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  if (ticks <= 0) {
    return newProfile;
  }

  // 1. Employee resource generation
  const totalResourcePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  newProfile.employees.forEach((employee: { name: string; count: number }) => {
    const employeeSettings = (settings as any)[employee.name];
    if (employeeSettings && employeeSettings.resource_per_tick) {
      totalResourcePerTick.resource_1 += employee.count * employeeSettings.resource_per_tick.resource_1;
      totalResourcePerTick.resource_2 += employee.count * employeeSettings.resource_per_tick.resource_2;
      totalResourcePerTick.resource_3 += employee.count * employeeSettings.resource_per_tick.resource_3;
    }
  });

  newProfile.resources.current.resource_1 = Math.min(
    newProfile.resources.max.resource_1,
    newProfile.resources.current.resource_1 + totalResourcePerTick.resource_1 * ticks
  );

  newProfile.resources.current.resource_2 = Math.min(
    newProfile.resources.max.resource_2,
    newProfile.resources.current.resource_2 + totalResourcePerTick.resource_2 * ticks
  );

  newProfile.resources.current.resource_3 = Math.min(
    newProfile.resources.max.resource_3 || Infinity, // Assuming resource_3 might not have a max
    newProfile.resources.current.resource_3 + totalResourcePerTick.resource_3 * ticks
  );

  // 2. Game income and maintenance
  const totalIncome: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const totalMaintenance: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  newProfile.games.forEach((game: Game) => {
    const gameData = settings.developable_games.find((g) => g.name === game.name);

    if (!gameData) return;

    if (game.status === 'developing') {
      game.development_progress_ticks += ticks;
      if (game.development_progress_ticks >= gameData.development_time_ticks) {
        game.status = 'completed';
        console.log(`Game "${game.name}" has been completed!`);
      }
    }

    if (game.status === 'completed') {
      totalIncome.resource_1 += gameData.income_per_tick.resource_1 * ticks;
      totalIncome.resource_2 += gameData.income_per_tick.resource_2 * ticks;
      totalIncome.resource_3 += gameData.income_per_tick.resource_3 * ticks;

      totalMaintenance.resource_1 += gameData.maintenance_cost_per_tick.resource_1 * ticks;
      totalMaintenance.resource_2 += gameData.maintenance_cost_per_tick.resource_2 * ticks;
      totalMaintenance.resource_3 += gameData.maintenance_cost_per_tick.resource_3 * ticks;
    }
  });

  // Apply income
  newProfile.resources.current.resource_1 += totalIncome.resource_1;
  newProfile.resources.current.resource_2 += totalIncome.resource_2;
  newProfile.resources.current.resource_3 += totalIncome.resource_3;

  // Apply maintenance
  newProfile.resources.current.resource_1 = Math.max(0, newProfile.resources.current.resource_1 - totalMaintenance.resource_1);
  newProfile.resources.current.resource_2 = Math.max(0, newProfile.resources.current.resource_2 - totalMaintenance.resource_2);
  newProfile.resources.current.resource_3 = Math.max(0, newProfile.resources.current.resource_3 - totalMaintenance.resource_3);

  return newProfile;
};

export const developGame = (
  currentProfile: SaveProfile,
  gameName: string,
  settings: GameSettings
): SaveProfile => {
  const gameData = settings.developable_games.find((g) => g.name === gameName);

  if (!gameData) {
    console.log(`Game "${gameName}" not found in settings.`);
    return currentProfile;
  }

  if (currentProfile.games.some((g) => g.name === gameName)) {
    console.log(`Game "${gameName}" is already owned or in development.`);
    return currentProfile;
  }

  const { development_cost } = gameData;
  const { current: currentResources } = currentProfile.resources;

  if (
    currentResources.resource_1 < development_cost.resource_1 ||
    currentResources.resource_2 < development_cost.resource_2 ||
    currentResources.resource_3 < development_cost.resource_3
  ) {
    console.log(`Insufficient resources to develop "${gameName}".`);
    return currentProfile;
  }

  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.current.resource_1 -= development_cost.resource_1;
  newProfile.resources.current.resource_2 -= development_cost.resource_2;
  newProfile.resources.current.resource_3 -= development_cost.resource_3;

  const newGame: Game = {
    name: gameName,
    status: 'developing',
    development_progress_ticks: 0,
  };

  newProfile.games.push(newGame);

  return newProfile;
};