import { GameSettings, SaveProfile, ResourceGroup, AcquiredAsset, InProgressAsset, Asset } from './types';

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
        assets.push({
          type: 'asset_group_2',
          id: assetId,
          count,
          development_progress_ticks: 0,
        });
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
    inProgressAssets: [],
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

  // Update in-progress assets
  const justCompletedAssets: InProgressAsset[] = [];
  if (newProfile.inProgressAssets) {
    newProfile.inProgressAssets.forEach((asset) => {
      const gameData = settings.assets_group_1.assets.find((g) => g.id === asset.id);
      if (!gameData) return;

      asset.development_progress_ticks += ticks;
      if (asset.development_progress_ticks >= gameData.time_cost_ticks) {
        asset.status = 'completed';
        justCompletedAssets.push(asset);
        console.log(`Game "${gameData.name}" has been completed!`);
      }
    });
  }

  // Move completed assets from inProgressAssets to assets
  if (justCompletedAssets.length > 0) {
    newProfile.inProgressAssets = newProfile.inProgressAssets.filter(
      (asset) => asset.status !== 'completed'
    );

    justCompletedAssets.forEach((completed) => {
      const existingAsset = newProfile.assets.find(
        (a) => a.id === completed.id && a.type === completed.type
      );
      if (existingAsset) {
        existingAsset.count += 1;
      } else {
        newProfile.assets.push({
          id: completed.id,
          type: completed.type,
          count: 1,
          development_progress_ticks: completed.development_progress_ticks,
        });
      }
    });
  }

  // Recalculate all resource modifiers from all assets
  const total_income_per_tick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const total_maintenance_per_tick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const max_resources: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  newProfile.assets.forEach((asset) => {
    let assetSettings;
    if (asset.type === 'asset_group_1') {
      assetSettings = settings.assets_group_1.assets.find((a: Asset) => a.id === asset.id);
    } else if (asset.type === 'asset_group_2') {
      assetSettings = settings.assets_group_2.assets.find((a: Asset) => a.id === asset.id);
    }

    if (assetSettings) {
      const count = asset.count || 1;
      if (assetSettings.income_per_tick) {
        total_income_per_tick.resource_1 += (assetSettings.income_per_tick.resource_1 || 0) * count;
        total_income_per_tick.resource_2 += (assetSettings.income_per_tick.resource_2 || 0) * count;
        total_income_per_tick.resource_3 += (assetSettings.income_per_tick.resource_3 || 0) * count;
      }
      if (assetSettings.maintenance_cost_per_tick) {
        total_maintenance_per_tick.resource_1 +=
          (assetSettings.maintenance_cost_per_tick.resource_1 || 0) * count;
        total_maintenance_per_tick.resource_2 +=
          (assetSettings.maintenance_cost_per_tick.resource_2 || 0) * count;
        total_maintenance_per_tick.resource_3 +=
          (assetSettings.maintenance_cost_per_tick.resource_3 || 0) * count;
      }
      if (assetSettings.resource_max) {
        max_resources.resource_1 += (assetSettings.resource_max.resource_1 || 0) * count;
        max_resources.resource_2 += (assetSettings.resource_max.resource_2 || 0) * count;
        max_resources.resource_3 += (assetSettings.resource_max.resource_3 || 0) * count;
      }
    }
  });

  // Update profile state for display and logic
  newProfile.resources.max = max_resources;
  newProfile.resources.per_tick = total_income_per_tick;

  // Apply income and maintenance for the tick period
  const { current } = newProfile.resources;
  const netIncomePerTick: ResourceGroup = {
    resource_1: total_income_per_tick.resource_1 - total_maintenance_per_tick.resource_1,
    resource_2: total_income_per_tick.resource_2 - total_maintenance_per_tick.resource_2,
    resource_3: total_income_per_tick.resource_3 - total_maintenance_per_tick.resource_3,
  };

  for (const resourceId in netIncomePerTick) {
    const key = resourceId as keyof ResourceGroup;
    const increment = netIncomePerTick[key] * ticks;

    let newAmount = current[key] + increment;

    // Apply max cap if the resource is not unlimited
    if (!settings.unlimited_resources.includes(key)) {
      newAmount = Math.min(newAmount, newProfile.resources.max[key]);
    }

    // Clamp to 0
    current[key] = Math.max(0, newAmount);
  }

  return newProfile;
};

export const addAsset = (
  currentProfile: SaveProfile,
  assetType: 'asset_group_1' | 'asset_group_2',
  assetId: string,
  settings: GameSettings
): SaveProfile => {
  let assetData;
  if (assetType === 'asset_group_1') {
    assetData = settings.assets_group_1.assets.find((a) => a.id === assetId);
  } else {
    assetData = settings.assets_group_2.assets.find((a) => a.id === assetId);
  }

  if (!assetData) {
    console.log(`Asset "${assetId}" of type "${assetType}" not found in settings.`);
    return currentProfile;
  }

  const { cost } = assetData;
  const { current: currentResources } = currentProfile.resources;

  if (
    currentResources.resource_1 < cost.resource_1 ||
    currentResources.resource_2 < cost.resource_2 ||
    currentResources.resource_3 < cost.resource_3
  ) {
    console.log(`Insufficient resources to acquire asset "${assetId}".`);
    return currentProfile;
  }

  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  newProfile.resources.current.resource_1 -= cost.resource_1;
  newProfile.resources.current.resource_2 -= cost.resource_2;
  newProfile.resources.current.resource_3 -= cost.resource_3;

  if (assetType === 'asset_group_1') {
    const newGame: InProgressAsset = {
      type: 'asset_group_1',
      id: assetId,
      status: 'in_progress',
      development_progress_ticks: 0,
      start_time: new Date(),
    };
    if (!newProfile.inProgressAssets) {
      newProfile.inProgressAssets = [];
    }
    newProfile.inProgressAssets.push(newGame);
  } else if (assetType === 'asset_group_2') {
    const employeeAsset = newProfile.assets.find(
      (a: AcquiredAsset) => a.type === 'asset_group_2' && a.id === assetId
    );

    if (employeeAsset) {
      employeeAsset.count += 1;
    } else {
      newProfile.assets.push({
        type: 'asset_group_2',
        id: assetId,
        count: 1,
        development_progress_ticks: 0,
      });
    }

    if (assetData.income_per_tick) {
      newProfile.resources.per_tick.resource_1 += assetData.income_per_tick.resource_1 || 0;
      newProfile.resources.per_tick.resource_2 += assetData.income_per_tick.resource_2 || 0;
      newProfile.resources.per_tick.resource_3 += assetData.income_per_tick.resource_3 || 0;
    }
    if (assetData.resource_max) {
      newProfile.resources.max.resource_1 += assetData.resource_max.resource_1 || 0;
      newProfile.resources.max.resource_2 += assetData.resource_max.resource_2 || 0;
      newProfile.resources.max.resource_3 += assetData.resource_max.resource_3 || 0;
    }
  }

  return newProfile;
};