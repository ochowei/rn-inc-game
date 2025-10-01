import gameSettings from '../game_settings.json';

export interface Game {
  name: string;
  status: 'developing' | 'completed';
  development_progress_ticks: number;
}

export interface SaveProfile {
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
  games: Game[];
  createdAt: string;
}

export const createNewSaveProfile = (): SaveProfile => {
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

export const updateSaveProfile = (
  currentProfile: SaveProfile,
  ticks: number
): SaveProfile => {
  const newProfile = JSON.parse(JSON.stringify(currentProfile));

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
  let totalIncome = 0;
  let totalMaintenanceCost = 0;

  newProfile.games.forEach((game: Game) => {
    const gameData = gameSettings.developable_games.find(
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
        gameData.maintenance_cost_per_tick.productivity * ticks;
    }
  });

  newProfile.resources.money += totalIncome;
  newProfile.resources.productivity = Math.max(
    0,
    newProfile.resources.productivity - totalMaintenanceCost
  );

  return newProfile;
};

export const developGame = (
  currentProfile: SaveProfile,
  gameName: string
): SaveProfile => {
  const gameData = gameSettings.developable_games.find(
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
    currentResources.money < development_cost.funding ||
    currentResources.productivity < development_cost.productivity ||
    currentResources.creativity < development_cost.creativity
  ) {
    console.log(`Insufficient resources to develop "${gameName}".`);
    return currentProfile;
  }

  // 4. Deduct costs and add the new game in development
  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.money -= development_cost.funding;
  newProfile.resources.productivity -= development_cost.productivity;
  newProfile.resources.creativity -= development_cost.creativity;

  const newGame: Game = {
    name: gameName,
    status: 'developing',
    development_progress_ticks: 0,
  };

  newProfile.games.push(newGame);

  return newProfile;
};
