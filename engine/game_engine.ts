import { GameSettings, Game, SaveProfile } from './types';

export const createNewSaveProfile = (settings: GameSettings): SaveProfile => {
  const { initial, engineer_level_1 } = settings;

  return {
    resources: {
      resource_1: initial.resources.resource_1,
      resource_2: initial.resources.resource_2,
      resource_1_max: engineer_level_1.resource_1_max,
      resource_2_max: engineer_level_1.resource_2_max,
      resource_3: initial.resources.resource_3,
      resource_1_per_tick: engineer_level_1.resource_1_per_tick,
      resource_2_per_tick: engineer_level_1.resource_2_per_tick,
      resource_3_per_tick: 0,
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
  let totalResource1PerTick = 0;
  let totalResource2PerTick = 0;

  newProfile.employees.forEach((employee: { name: string; count: number }) => {
    const employeeSettings = (settings as any)[employee.name];
    if (employeeSettings) {
      totalResource1PerTick +=
        employee.count * employeeSettings.resource_1_per_tick;
      totalResource2PerTick +=
        employee.count * employeeSettings.resource_2_per_tick;
    }
  });

  newProfile.resources.resource_1 = Math.min(
    newProfile.resources.resource_1_max,
    newProfile.resources.resource_1 + totalResource1PerTick * ticks
  );

  newProfile.resources.resource_2 = Math.min(
    newProfile.resources.resource_2_max,
    newProfile.resources.resource_2 + totalResource2PerTick * ticks
  );

  // 2. Game income and maintenance
  let totalIncome = 0;
  let totalMaintenanceCost = 0;

  newProfile.games.forEach((game: Game) => {
    const gameData = settings.developable_games.find(
      (g) => g.name === game.name
    );

    if (!gameData) return;

    // If the game is in development, update its progress.
    if (game.status === 'developing') {
      game.development_progress_ticks += ticks;

      // If development is complete, change its status.
      if (game.development_progress_ticks >= gameData.development_time_ticks) {
        game.status = 'completed';
        // Optional: Log completion
        console.log(`Game "${game.name}" has been completed!`);
      }
    }

    // If the game is completed, calculate income and maintenance.
    if (game.status === 'completed') {
      totalIncome += gameData.income_per_tick * ticks;
      totalMaintenanceCost +=
        gameData.maintenance_cost_per_tick.resource_2 * ticks;
    }
  });

  newProfile.resources.resource_3 += totalIncome;
  newProfile.resources.resource_2 = Math.max(
    0,
    newProfile.resources.resource_2 - totalMaintenanceCost
  );

  return newProfile;
};

export const developGame = (
  currentProfile: SaveProfile,
  gameName: string,
  settings: GameSettings
): SaveProfile => {
  const gameData = settings.developable_games.find(
    (g) => g.name === gameName
  );

  // 1. Game not found in settings
  if (!gameData) {
    console.log(`Game "${gameName}" not found in settings.`);
    return currentProfile;
  }

  // 2. Game already exists (either completed or in development)
  if (currentProfile.games.some((g) => g.name === gameName)) {
    console.log(`Game "${gameName}" is already owned or in development.`);
    return currentProfile;
  }

  const { development_cost } = gameData;
  const currentResources = currentProfile.resources;

  // 3. Check for sufficient resources
  if (
    currentResources.resource_3 < development_cost.resource_3 ||
    currentResources.resource_2 < development_cost.resource_2 ||
    currentResources.resource_1 < development_cost.resource_1
  ) {
    console.log(`Insufficient resources to develop "${gameName}".`);
    return currentProfile;
  }

  // 4. Deduct costs and add the new game in development
  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.resource_3 -= development_cost.resource_3;
  newProfile.resources.resource_2 -= development_cost.resource_2;
  newProfile.resources.resource_1 -= development_cost.resource_1;

  const newGame: Game = {
    name: gameName,
    status: 'developing',
    development_progress_ticks: 0,
  };

  newProfile.games.push(newGame);

  return newProfile;
};
