import { GameSettings, SaveProfile, ResourceGroup, AcquiredAsset, InProgressAsset, Asset, OwnedContainer } from './types';

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

  const owned_containers: OwnedContainer[] = [
    {
      id: `container_${new Date().getTime()}`,
      typeId: 'studio_1',
    },
  ];

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
    owned_containers,
    createdAt: new Date().toISOString(),
  };
};

export const calculateTotalCapacity = (
  profile: SaveProfile,
  settings: GameSettings
): Record<string, number> => {
  const totalCapacity: Record<string, number> = {};

  if (!profile.owned_containers || !settings.container_types) {
    return totalCapacity;
  }

  profile.owned_containers.forEach((ownedContainer) => {
    const containerType = settings.container_types.find(
      (ct) => ct.id === ownedContainer.typeId
    );

    if (containerType) {
      for (const assetGroupId in containerType.capacities) {
        if (Object.prototype.hasOwnProperty.call(containerType.capacities, assetGroupId)) {
          const capacity = containerType.capacities[assetGroupId];
          if (totalCapacity[assetGroupId]) {
            totalCapacity[assetGroupId] += capacity;
          } else {
            totalCapacity[assetGroupId] = capacity;
          }
        }
      }
    }
  });

  return totalCapacity;
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
  const gameIncomePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const employeeResourcePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const baseMaxResources: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  const unlimitedMaintenancePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };
  const limitedMaintenancePerTick: ResourceGroup = { resource_1: 0, resource_2: 0, resource_3: 0 };

  newProfile.assets.forEach((asset) => {
    const count = asset.count || 1;
    if (asset.type === 'asset_group_2') { // Employees
      const employeeData = settings.assets_group_2.assets.find((e) => e.id === asset.id);
      if (employeeData) {
        if (employeeData.income_per_tick) {
          employeeResourcePerTick.resource_1 += (employeeData.income_per_tick.resource_1 || 0) * count;
          employeeResourcePerTick.resource_2 += (employeeData.income_per_tick.resource_2 || 0) * count;
          employeeResourcePerTick.resource_3 += (employeeData.income_per_tick.resource_3 || 0) * count;
        }
        if (employeeData.resource_max) {
          baseMaxResources.resource_1 += (employeeData.resource_max.resource_1 || 0) * count;
          baseMaxResources.resource_2 += (employeeData.resource_max.resource_2 || 0) * count;
          baseMaxResources.resource_3 += (employeeData.resource_max.resource_3 || 0) * count;
        }
      }
    } else if (asset.type === 'asset_group_1') { // Games
      const gameData = settings.assets_group_1.assets.find((g) => g.id === asset.id);
      if (gameData) {
        // Handle game income
        if (gameData.income_per_tick) {
          gameIncomePerTick.resource_1 += (gameData.income_per_tick.resource_1 || 0) * count;
          gameIncomePerTick.resource_2 += (gameData.income_per_tick.resource_2 || 0) * count;
          gameIncomePerTick.resource_3 += (gameData.income_per_tick.resource_3 || 0) * count;
        }
        // Handle game maintenance
        if (gameData.maintenance_cost_per_tick) {
          for (const key in gameData.maintenance_cost_per_tick) {
            const resourceKey = key as keyof ResourceGroup;
            const cost = (gameData.maintenance_cost_per_tick[resourceKey] || 0) * count;
            if (settings.unlimited_resources.includes(resourceKey)) {
              unlimitedMaintenancePerTick[resourceKey] += cost;
            } else {
              limitedMaintenancePerTick[resourceKey] += cost;
            }
          }
        }
      }
    }
  });

  // 1. Calculate new MAX resources based on limited maintenance cost
  newProfile.resources.max.resource_1 = Math.max(0, baseMaxResources.resource_1 - limitedMaintenancePerTick.resource_1);
  newProfile.resources.max.resource_2 = Math.max(0, baseMaxResources.resource_2 - limitedMaintenancePerTick.resource_2);
  newProfile.resources.max.resource_3 = Math.max(0, baseMaxResources.resource_3 - limitedMaintenancePerTick.resource_3);

  // 2. Calculate NET income for unlimited resources
  const netEmployeeResourcePerTick: ResourceGroup = {
    resource_1: employeeResourcePerTick.resource_1 - unlimitedMaintenancePerTick.resource_1,
    resource_2: employeeResourcePerTick.resource_2 - unlimitedMaintenancePerTick.resource_2,
    resource_3: employeeResourcePerTick.resource_3 - unlimitedMaintenancePerTick.resource_3,
  };

  // 3. Calculate total income per tick for display
  const totalIncomePerTick: ResourceGroup = {
    resource_1: employeeResourcePerTick.resource_1 + gameIncomePerTick.resource_1,
    resource_2: employeeResourcePerTick.resource_2 + gameIncomePerTick.resource_2,
    resource_3: employeeResourcePerTick.resource_3 + gameIncomePerTick.resource_3,
  };
  newProfile.resources.per_tick = totalIncomePerTick;

  // 4. Apply resource changes for the tick period
  const { current } = newProfile.resources;

  // Process each resource based on whether it's limited or unlimited
  (Object.keys(current) as Array<keyof ResourceGroup>).forEach(key => {
    // Gross income from all sources for this tick
    const grossIncome = (employeeResourcePerTick[key] + gameIncomePerTick[key]) * ticks;

    if (settings.unlimited_resources.includes(key)) {
      // For unlimited resources, maintenance reduces income rate
      const maintenanceCost = unlimitedMaintenancePerTick[key] * ticks;
      const netIncrement = grossIncome - maintenanceCost;
      current[key] = Math.max(0, current[key] + netIncrement);
    } else {
      // For limited resources, maintenance reduces max capacity.
      // We add the gross income and then cap it at the new max.
      current[key] = Math.min(
        newProfile.resources.max[key],
        current[key] + grossIncome
      );
      // Clamp to 0
      current[key] = Math.max(0, current[key]);
    }
  });

  return newProfile;
};

export const purchaseContainer = (
  currentProfile: SaveProfile,
  containerTypeId: string,
  settings: GameSettings
): SaveProfile => {
  const containerType = settings.container_types.find(
    (ct) => ct.id === containerTypeId
  );

  if (!containerType) {
    console.log(`Container type "${containerTypeId}" not found in settings.`);
    return currentProfile;
  }

  const { cost } = containerType;
  const { current: currentResources } = currentProfile.resources;

  for (const costItem of cost) {
    if (currentResources[costItem.resource_id] < costItem.amount) {
      console.log(
        `Insufficient resources to purchase container "${containerTypeId}".`
      );
      return currentProfile;
    }
  }

  const newProfile = JSON.parse(JSON.stringify(currentProfile));

  for (const costItem of cost) {
    newProfile.resources.current[costItem.resource_id] -= costItem.amount;
  }

  const newContainer: OwnedContainer = {
    id: `container_${new Date().getTime()}`,
    typeId: containerTypeId,
  };

  newProfile.owned_containers.push(newContainer);

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

  // Check for capacity
  const totalCapacity = calculateTotalCapacity(currentProfile, settings);
  const capacityForAssetGroup = totalCapacity[assetType];

  if (capacityForAssetGroup !== undefined) {
    const currentOwnedCount = currentProfile.assets
      .filter((a) => a.type === assetType)
      .reduce((sum, a) => sum + a.count, 0);

    const inProgressCount = (currentProfile.inProgressAssets || [])
      .filter((a) => a.type === assetType)
      .length;

    const totalCurrentCount = currentOwnedCount + inProgressCount;

    if (totalCurrentCount >= capacityForAssetGroup) {
      console.log(`Capacity for asset group "${assetType}" is full.`);
      return currentProfile;
    }
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