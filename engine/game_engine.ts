import { GameSettings, SaveProfile, ResourceGroup, AcquiredAsset } from './types';

export const createNewSaveProfile = (settings: GameSettings): SaveProfile => {
  const { initial } = settings;

  const max_resources: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const per_tick_resources: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const assets: AcquiredAsset[] = [];

  for (const assetId in initial.assets) {
    const count = initial.assets[assetId];
    if (count > 0) {
      const employeeData = settings.assets_group_2.assets.find((e) => e.id === assetId);
      if (employeeData) {
        if (employeeData.resource_max) {
          max_resources.resource_1 += (employeeData.resource_max.resource_1 || 0) * count;
          max_resources.resource_2 += (employeeData.resource_max.resource_2 || 0) * count;
          max_resources.resource_3 += (employeeData.resource_max.resource_3 || 0) * count;
        }
        if (employeeData.income_per_tick) {
          per_tick_resources.resource_1 += (employeeData.income_per_tick.resource_1 || 0) * count;
          per_tick_resources.resource_2 += (employeeData.income_per_tick.resource_2 || 0) * count;
          per_tick_resources.resource_3 += (employeeData.income_per_tick.resource_3 || 0) * count;
        }
        assets.push({ type: 'employee', id: assetId, count });
      }
    }
  }

  return {
    resources: {
      current: {
        resource_1: initial.resources.resource_1,
        resource_2: initial.resources.resource_2,
        resource_3: initial.resources.resource_3,
      },
      max: max_resources,
      per_tick: per_tick_resources,
    },
    assets,
    createdAt: new Date().toISOString(),
  };
};

export const updateSaveProfile = (
  currentProfile: SaveProfile,
  ticks: number,
  settings: GameSettings
): SaveProfile => {
  const newProfile: SaveProfile = JSON.parse(JSON.stringify(currentProfile));

  if (ticks <= 0) {
    return newProfile;
  }

  const employeeResourcePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const gameIncome: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const gameMaintenance: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  newProfile.assets.forEach((asset) => {
    if (asset.type === 'employee') {
      const employeeSettings = settings.assets_group_2.assets.find((e) => e.id === asset.id);
      if (employeeSettings && employeeSettings.income_per_tick) {
        employeeResourcePerTick.resource_1 += asset.count * (employeeSettings.income_per_tick.resource_1 || 0);
        employeeResourcePerTick.resource_2 += asset.count * (employeeSettings.income_per_tick.resource_2 || 0);
        employeeResourcePerTick.resource_3 += asset.count * (employeeSettings.income_per_tick.resource_3 || 0);
      }
    } else if (asset.type === 'game') {
      const gameData = settings.assets_group_1.assets.find((g) => g.id === asset.id);
      if (!gameData) return;

      if (asset.status === 'developing') {
        asset.development_progress_ticks += ticks;
        if (asset.development_progress_ticks >= gameData.time_cost_ticks) {
          asset.status = 'completed';
          console.log(`Game "${gameData.name}" has been completed!`);
        }
      }

      if (asset.status === 'completed') {
        gameIncome.resource_1 += gameData.income_per_tick.resource_1 * ticks;
        gameIncome.resource_2 += gameData.income_per_tick.resource_2 * ticks;
        gameIncome.resource_3 += gameData.income_per_tick.resource_3 * ticks;

        if (gameData.maintenance_cost_per_tick) {
          gameMaintenance.resource_1 += gameData.maintenance_cost_per_tick.resource_1 * ticks;
          gameMaintenance.resource_2 += gameData.maintenance_cost_per_tick.resource_2 * ticks;
          gameMaintenance.resource_3 += gameData.maintenance_cost_per_tick.resource_3 * ticks;
        }
      }
    }
  });

  // Apply employee generation
  newProfile.resources.current.resource_1 = Math.min(
    newProfile.resources.max.resource_1,
    newProfile.resources.current.resource_1 + employeeResourcePerTick.resource_1 * ticks
  );
  newProfile.resources.current.resource_2 = Math.min(
    newProfile.resources.max.resource_2,
    newProfile.resources.current.resource_2 + employeeResourcePerTick.resource_2 * ticks
  );
  newProfile.resources.current.resource_3 = Math.min(
    newProfile.resources.max.resource_3 || Infinity,
    newProfile.resources.current.resource_3 + employeeResourcePerTick.resource_3 * ticks
  );

  // Apply game income
  newProfile.resources.current.resource_1 += gameIncome.resource_1;
  newProfile.resources.current.resource_2 += gameIncome.resource_2;
  newProfile.resources.current.resource_3 += gameIncome.resource_3;

  // Apply game maintenance
  newProfile.resources.current.resource_1 = Math.max(0, newProfile.resources.current.resource_1 - gameMaintenance.resource_1);
  newProfile.resources.current.resource_2 = Math.max(0, newProfile.resources.current.resource_2 - gameMaintenance.resource_2);
  newProfile.resources.current.resource_3 = Math.max(0, newProfile.resources.current.resource_3 - gameMaintenance.resource_3);

  return newProfile;
};

export const hireEmployee = (
  currentProfile: SaveProfile,
  employeeId: string,
  settings: GameSettings
): SaveProfile => {
  const employeeData = settings.assets_group_2.assets.find((e) => e.id === employeeId);

  if (!employeeData) {
    console.log(`Employee "${employeeId}" not found in settings.`);
    return currentProfile;
  }

  const { cost } = employeeData;
  const { current: currentResources } = currentProfile.resources;

  if (
    currentResources.resource_1 < cost.resource_1 ||
    currentResources.resource_2 < cost.resource_2 ||
    currentResources.resource_3 < cost.resource_3
  ) {
    console.log(`Insufficient resources to hire "${employeeId}".`);
    return currentProfile;
  }

  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.current.resource_1 -= cost.resource_1;
  newProfile.resources.current.resource_2 -= cost.resource_2;
  newProfile.resources.current.resource_3 -= cost.resource_3;

  const employeeAsset = newProfile.assets.find(
    (a) => a.type === 'employee' && a.id === employeeId
  );

  if (employeeAsset && employeeAsset.type === 'employee') {
    employeeAsset.count += 1;
  } else {
    newProfile.assets.push({ type: 'employee', id: employeeId, count: 1 });
  }

  if (employeeData.income_per_tick) {
    newProfile.resources.per_tick.resource_1 += employeeData.income_per_tick.resource_1;
    newProfile.resources.per_tick.resource_2 += employeeData.income_per_tick.resource_2;
    newProfile.resources.per_tick.resource_3 += employeeData.income_per_tick.resource_3;
  }
  if (employeeData.resource_max) {
    newProfile.resources.max.resource_1 += employeeData.resource_max.resource_1;
    newProfile.resources.max.resource_2 += employeeData.resource_max.resource_2;
    newProfile.resources.max.resource_3 += employeeData.resource_max.resource_3;
  }

  return newProfile;
};

export const developGame = (
  currentProfile: SaveProfile,
  gameId: string,
  settings: GameSettings
): SaveProfile => {
  const gameData = settings.assets_group_1.assets.find((g) => g.id === gameId);

  if (!gameData) {
    console.log(`Game "${gameId}" not found in settings.`);
    return currentProfile;
  }

  if (currentProfile.assets.some((a) => a.type === 'game' && a.id === gameId)) {
    console.log(`Game "${gameId}" is already owned or in development.`);
    return currentProfile;
  }

  const { cost } = gameData;
  const { current: currentResources } = currentProfile.resources;

  if (
    currentResources.resource_1 < cost.resource_1 ||
    currentResources.resource_2 < cost.resource_2 ||
    currentResources.resource_3 < cost.resource_3
  ) {
    console.log(`Insufficient resources to develop "${gameId}".`);
    return currentProfile;
  }

  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.current.resource_1 -= cost.resource_1;
  newProfile.resources.current.resource_2 -= cost.resource_2;
  newProfile.resources.current.resource_3 -= cost.resource_3;

  const newGame: AcquiredAsset = {
    type: 'game',
    id: gameId,
    status: 'developing',
    development_progress_ticks: 0,
  };

  newProfile.assets.push(newGame);

  return newProfile;
};