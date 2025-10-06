import { createNewSaveProfile, updateSaveProfile, addAsset, purchaseContainer, calculateTotalCapacity } from './game_engine';
import { SaveProfile, GameSettings } from './types';
import gameSettings from '../settings.json';

// Type assertion for gameSettings
const settings = gameSettings as GameSettings;

describe('createNewSaveProfile', () => {
  it('should create a new save profile with correct initial values', () => {
    const mockDate = new Date(1672531200000); // 2023-01-01T00:00:00.000Z
    const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const newProfile: SaveProfile = createNewSaveProfile(settings);
    const expectedCreatedAt = mockDate.toISOString();

    // Check initial resources
    expect(newProfile.resources.current.resource_1).toBe(settings.initial.resources.resource_1);
    expect(newProfile.resources.current.resource_2).toBe(settings.initial.resources.resource_2);
    expect(newProfile.resources.current.resource_3).toBe(settings.initial.resources.resource_3);

    // Calculate expected max and per_tick resources from initial assets
    const engineerSettings = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
    const initialEngineerCount = settings.initial.assets.engineer_level_1;

    const expectedMaxResource1 = (engineerSettings.resource_max?.resource_1 || 0) * initialEngineerCount;
    const expectedMaxResource2 = (engineerSettings.resource_max?.resource_2 || 0) * initialEngineerCount;

    const expectedPerTickResource1 = (engineerSettings.income_per_tick?.resource_1 || 0) * initialEngineerCount;
    const expectedPerTickResource2 = (engineerSettings.income_per_tick?.resource_2 || 0) * initialEngineerCount;
    const expectedPerTickResource3 = (engineerSettings.income_per_tick?.resource_3 || 0) * initialEngineerCount;

    expect(newProfile.resources.max.resource_1).toBe(expectedMaxResource1);
    expect(newProfile.resources.max.resource_2).toBe(expectedMaxResource2);
    expect(newProfile.resources.per_tick.resource_1).toBe(expectedPerTickResource1);
    expect(newProfile.resources.per_tick.resource_2).toBe(expectedPerTickResource2);
    expect(newProfile.resources.per_tick.resource_3).toBe(expectedPerTickResource3);

    // Check initial assets
    const engineerAsset = newProfile.assets.find(a => a.type === 'asset_group_2' && a.id === 'engineer_level_1');
    expect(engineerAsset).toBeDefined();
    expect(engineerAsset?.count).toBe(settings.initial.assets.engineer_level_1);
    const gameAssets = newProfile.assets.filter(a => a.type === 'asset_group_1');
    expect(gameAssets.length).toBe(0);

    // Check inProgressAssets
    expect(newProfile.inProgressAssets).toEqual([]);

    // Check createdAt timestamp
    expect(newProfile.createdAt).toBe(expectedCreatedAt);

    dateSpy.mockRestore();
  });
});

describe('calculateTotalCapacity', () => {
  let profile: SaveProfile;

  beforeEach(() => {
    profile = createNewSaveProfile(settings);
  });

  it('should correctly calculate the total capacity from all owned containers', () => {
    // Initially, the profile has one "studio_1"
    const initialCapacity = calculateTotalCapacity(profile, settings);
    expect(initialCapacity['asset_group_1']).toBe(30);
    expect(initialCapacity['asset_group_2']).toBe(10);

    // Add a second container
    profile.owned_containers.push({ id: 'c2', typeId: 'studio_2' });
    const updatedCapacity = calculateTotalCapacity(profile, settings);
    expect(updatedCapacity['asset_group_1']).toBe(30 + 100);
    expect(updatedCapacity['asset_group_2']).toBe(10 + 25);
  });

  it('should return an empty object if the profile has no containers', () => {
    profile.owned_containers = [];
    const capacity = calculateTotalCapacity(profile, settings);
    expect(capacity).toEqual({});
  });
});

describe('purchaseContainer', () => {
  let profile: SaveProfile;

  beforeEach(() => {
    profile = createNewSaveProfile(settings);
    // Give the player enough resources to buy a studio
    profile.resources.current.resource_3 = 15000;
  });

  it('should add the container and deduct the cost if resources are sufficient', () => {
    const studio2 = settings.container_types.find(c => c.id === 'studio_2')!;
    const initialContainerCount = profile.owned_containers.length;
    const initialResources = profile.resources.current.resource_3;

    const updatedProfile = purchaseContainer(profile, 'studio_2', settings);

    // Check if container was added
    expect(updatedProfile.owned_containers.length).toBe(initialContainerCount + 1);
    expect(updatedProfile.owned_containers.find(c => c.typeId === 'studio_2')).toBeDefined();

    // Check if cost was deducted
    const cost = studio2.cost.find(c => c.resource_id === 'resource_3')!.amount;
    expect(updatedProfile.resources.current.resource_3).toBe(initialResources - cost);
  });

  it('should not purchase the container if resources are insufficient', () => {
    profile.resources.current.resource_3 = 500; // Not enough for studio_2
    const updatedProfile = purchaseContainer(profile, 'studio_2', settings);
    expect(updatedProfile).toEqual(profile); // Profile should be unchanged
  });

  it('should not purchase a container that does not exist', () => {
    const updatedProfile = purchaseContainer(profile, 'non_existent_studio', settings);
    expect(updatedProfile).toEqual(profile); // Profile should be unchanged
  });
});

describe('addAsset with capacity limits', () => {
  let profile: SaveProfile;

  beforeEach(() => {
    profile = createNewSaveProfile(settings);
    // Set a higher resource amount to cover both container purchase and asset hiring
    profile.resources.current.resource_3 = 11000;
  });

  it('should block adding an asset if capacity is full', () => {
    const employeeCapacity = settings.container_types.find(c => c.id === 'studio_1')!.capacities['asset_group_2'];
    // Fill up the employee capacity. Initial profile has 1 engineer.
    profile.assets.find(a => a.id === 'engineer_level_1')!.count = employeeCapacity;

    // Try to hire one more
    const updatedProfile = addAsset(profile, 'asset_group_2', 'engineer_level_1', settings);

    // The profile should not have changed
    expect(updatedProfile).toEqual(profile);
    const employeeAsset = updatedProfile.assets.find(a => a.id === 'engineer_level_1');
    expect(employeeAsset?.count).toBe(employeeCapacity);
  });

  it('should allow adding an asset if there is capacity', () => {
    const employeeCapacity = settings.container_types.find(c => c.id === 'studio_1')!.capacities['asset_group_2'];
    // We have 1 engineer, capacity is 10. We can hire more.
    const initialCount = profile.assets.find(a => a.id === 'engineer_level_1')!.count;

    const updatedProfile = addAsset(profile, 'asset_group_2', 'engineer_level_1', settings);

    const employeeAsset = updatedProfile.assets.find(a => a.id === 'engineer_level_1');
    expect(employeeAsset?.count).toBe(initialCount + 1);
    expect(employeeAsset?.count).toBeLessThanOrEqual(employeeCapacity);
  });

  it('should correctly account for in-progress assets when checking capacity', () => {
    const gameCapacity = settings.container_types.find(c => c.id === 'studio_1')!.capacities['asset_group_1'];

    // Fill up game capacity with a mix of completed and in-progress games
    profile.assets.push({ type: 'asset_group_1', id: 'puzzle_game', count: gameCapacity - 1, development_progress_ticks: 999 });
    profile.inProgressAssets.push({ type: 'asset_group_1', id: 'novel_game', status: 'in_progress', development_progress_ticks: 1, start_time: new Date() });

    // Now we are at capacity (29 completed, 1 in progress). Try to add one more.
    const updatedProfile = addAsset(profile, 'asset_group_1', 'novel_game', settings);

    // It should be blocked
    expect(updatedProfile.inProgressAssets.length).toBe(1);
    expect(updatedProfile).toEqual(profile);
  });

  it('should allow adding an asset after purchasing a new container', () => {
    const employeeCapacity = settings.container_types.find(c => c.id === 'studio_1')!.capacities['asset_group_2'];
    // Fill up the initial employee capacity
    profile.assets.find(a => a.id === 'engineer_level_1')!.count = employeeCapacity;

    // Try to hire one more - should fail
    const profileBeforePurchase = addAsset(profile, 'asset_group_2', 'engineer_level_1', settings);
    expect(profileBeforePurchase.assets.find(a => a.id === 'engineer_level_1')!.count).toBe(employeeCapacity);

    // Now, purchase a new container
    const profileAfterPurchase = purchaseContainer(profile, 'studio_2', settings);

    // Try to hire again - should succeed
    const finalProfile = addAsset(profileAfterPurchase, 'asset_group_2', 'engineer_level_1', settings);
    expect(finalProfile.assets.find(a => a.id === 'engineer_level_1')!.count).toBe(employeeCapacity + 1);
  });
});

describe('updateSaveProfile', () => {
  let initialProfile: SaveProfile;

  beforeEach(() => {
    initialProfile = createNewSaveProfile(settings);
  });

  it('should not update profile if no ticks have passed', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 0, settings);
    expect(updatedProfile).toEqual(initialProfile);
  });

  it('should increase resources based on employees and ticks', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 3, settings); // 3 ticks

    const engineerData = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
    const { income_per_tick } = engineerData!;
    const expectedResource1 = (income_per_tick!.resource_1 || 0) * 3;
    const expectedResource2 = (income_per_tick!.resource_2 || 0) * 3;

    expect(updatedProfile.resources.current.resource_1).toBe(expectedResource1);
    expect(updatedProfile.resources.current.resource_2).toBe(expectedResource2);
  });

  it('should cap resources that are not in the unlimited list', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 100, settings); // a lot of ticks

    expect(updatedProfile.resources.current.resource_1).toBe(initialProfile.resources.max.resource_1);
    expect(updatedProfile.resources.current.resource_2).toBe(initialProfile.resources.max.resource_2);
  });

  it('should allow unlimited resources to exceed their max capacity', () => {
    // Add a completed game to generate resource_3
    initialProfile.assets.push({
      type: 'asset_group_1',
      id: 'novel_game',
      count: 1,
      development_progress_ticks: 6,
    });

    const updatedProfile = updateSaveProfile(initialProfile, 500, settings); // a lot of ticks

    // resource_1 and resource_2 should be capped
    expect(updatedProfile.resources.current.resource_1).toBe(updatedProfile.resources.max.resource_1);
    expect(updatedProfile.resources.current.resource_2).toBe(updatedProfile.resources.max.resource_2);

    // resource_3 is unlimited, so it should accumulate beyond any "max" value.
    const novelGameData = settings.assets_group_1.assets.find(g => g.id === 'novel_game')!;
    const r3IncomePerTick = novelGameData.income_per_tick.resource_3;
    const expectedR3 = initialProfile.resources.current.resource_3 + r3IncomePerTick * 500;

    expect(updatedProfile.resources.current.resource_3).toBe(expectedR3);
    // The initial max for R3 is 0, so it should be greater than that.
    expect(updatedProfile.resources.current.resource_3).toBeGreaterThan(updatedProfile.resources.max.resource_3);
  });

  it('should cap a resource if it is removed from the unlimited list', () => {
    // Create a temporary settings object where resource_3 is NOT unlimited
    const limitedSettings: GameSettings = JSON.parse(JSON.stringify(settings));
    limitedSettings.unlimited_resources = []; // No unlimited resources

    // In the default settings, resource_3 has no max capacity.
    // Let's give it one by adding a new asset that provides it.
    const managerAsset = {
        id: "manager_level_1",
        name: "Manager",
        cost: { resource_1: 0, resource_2: 0, resource_3: 0 },
        time_cost_ticks: 0,
        income_per_tick: { resource_1: 0, resource_2: 0, resource_3: 0 },
        resource_max: { resource_1: 0, resource_2: 0, resource_3: 500 }
    };
    limitedSettings.assets_group_2.assets.push(managerAsset);

    // Add this new manager asset to the profile to establish a max
    initialProfile.assets.push({
        type: 'asset_group_2',
        id: 'manager_level_1',
        count: 1,
        development_progress_ticks: 0,
    });

    // Add a completed game to generate resource_3
    initialProfile.assets.push({
      type: 'asset_group_1',
      id: 'novel_game',
      count: 1,
      development_progress_ticks: 6,
    });

    const updatedProfile = updateSaveProfile(initialProfile, 1000, limitedSettings); // a lot of ticks

    // Now, resource_3 should be capped at its max value from the manager.
    // The recalculation inside updateSaveProfile should set resources.max.resource_3 to 500.
    expect(updatedProfile.resources.max.resource_3).toBe(500);
    expect(updatedProfile.resources.current.resource_3).toBe(500);
  });

  it('should apply maintenance cost correctly based on resource type', () => {
    // Add a completed game that has maintenance costs
    initialProfile.assets.push({
      type: 'asset_group_1',
      id: 'novel_game', // This game has maintenance for resource_2 (limited) and resource_3 (unlimited)
      count: 1,
      development_progress_ticks: 999, // Already completed
    });

    const gameData = settings.assets_group_1.assets.find((g) => g.id === 'novel_game')!;
    const maintenanceR2 = gameData.maintenance_cost_per_tick!.resource_2!;
    const maintenanceR3 = gameData.maintenance_cost_per_tick!.resource_3!;

    const initialMaxR2 = initialProfile.resources.max.resource_2;
    const initialPerTickR3 = initialProfile.resources.per_tick.resource_3;
    const gameIncomeR3 = gameData.income_per_tick.resource_3;

    const updatedProfile = updateSaveProfile(initialProfile, 1, settings);

    // 1. Verify Limited Resource (resource_2): Maintenance should reduce MAX capacity.
    const expectedMaxR2 = initialMaxR2 - maintenanceR2;
    expect(updatedProfile.resources.max.resource_2).toBe(expectedMaxR2);

    // Current amount should not be directly reduced by maintenance, only capped by the new max.
    const engineerData = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
    const incomeR2 = engineerData.income_per_tick!.resource_2 || 0;
    const expectedCurrentR2 = Math.min(initialProfile.resources.current.resource_2 + incomeR2, expectedMaxR2);
    expect(updatedProfile.resources.current.resource_2).toBe(expectedCurrentR2);

    // 2. Verify Unlimited Resource (resource_3): Maintenance should reduce NET INCOME.
    const expectedNetR3PerTick = (initialPerTickR3 + gameIncomeR3) - maintenanceR3;
    const expectedCurrentR3 = initialProfile.resources.current.resource_3 + expectedNetR3PerTick;
    expect(updatedProfile.resources.current.resource_3).toBe(expectedCurrentR3);

    // Max for R3 should remain unaffected by its own maintenance.
    expect(updatedProfile.resources.max.resource_3).toBe(initialProfile.resources.max.resource_3);
  });

  it('should move a completed game from inProgressAssets to assets', () => {
    const gameToDevelop = settings.assets_group_1.assets.find(g => g.id === 'novel_game')!;
    initialProfile.inProgressAssets = [
      {
        type: 'asset_group_1',
        id: 'novel_game',
        status: 'in_progress',
        development_progress_ticks: 0,
        start_time: new Date(),
      },
    ];
    const updatedProfile = updateSaveProfile(initialProfile, gameToDevelop.time_cost_ticks, settings);
    expect(updatedProfile.inProgressAssets.length).toBe(0);
    const completedGame = updatedProfile.assets.find(a => a.id === 'novel_game');
    expect(completedGame).toBeDefined();
    expect(completedGame?.count).toBe(1);
  });
});

describe('addAsset', () => {
  let initialProfile: SaveProfile;

  beforeEach(() => {
    initialProfile = createNewSaveProfile(settings);
    // Give player enough resources for testing
    initialProfile.resources.current.resource_1 = 100;
    initialProfile.resources.current.resource_2 = 100;
    initialProfile.resources.current.resource_3 = 100;
  });

  // Test for developing a game (asset_group_1)
  describe('when adding a game (asset_group_1)', () => {
    it('should start developing a game if resources are sufficient', () => {
      const gameToDevelop = settings.assets_group_1.assets[0];
      const updatedProfile = addAsset(initialProfile, 'asset_group_1', gameToDevelop.id, settings);

      // Check if costs are deducted
      expect(updatedProfile.resources.current.resource_1).toBe(100 - gameToDevelop.cost.resource_1);
      expect(updatedProfile.resources.current.resource_2).toBe(100 - gameToDevelop.cost.resource_2);
      expect(updatedProfile.resources.current.resource_3).toBe(100 - gameToDevelop.cost.resource_3);

      // Check if game is added to profile with 'in_progress' status
      const gameAsset = updatedProfile.inProgressAssets.find(a => a.type === 'asset_group_1' && a.id === gameToDevelop.id);
      expect(gameAsset).toBeDefined();
      expect(gameAsset!.status).toBe('in_progress');
    });

    it('should not develop a game if resources are insufficient', () => {
      initialProfile.resources.current.resource_3 = 0; // Not enough money
      const gameToDevelop = settings.assets_group_1.assets[0];
      const updatedProfile = addAsset(initialProfile, 'asset_group_1', gameToDevelop.id, settings);

      // Profile should not change
      expect(updatedProfile).toEqual(initialProfile);
    });
  });

  // Test for hiring an employee (asset_group_2)
  describe('when adding an employee (asset_group_2)', () => {
    it('should hire an employee if resources are sufficient', () => {
      const employeeToHire = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
      const updatedProfile = addAsset(initialProfile, 'asset_group_2', employeeToHire.id, settings);

      // Check if costs are deducted
      expect(updatedProfile.resources.current.resource_1).toBe(100 - employeeToHire.cost.resource_1);
      expect(updatedProfile.resources.current.resource_2).toBe(100 - employeeToHire.cost.resource_2);
      expect(updatedProfile.resources.current.resource_3).toBe(100 - employeeToHire.cost.resource_3);

      // Check if employee is added to assets
      const employeeAsset = updatedProfile.assets.find(a => a.type === 'asset_group_2' && a.id === employeeToHire.id);
      expect(employeeAsset).toBeDefined();
      expect(employeeAsset!.count).toBe(2);

      // Check if resource limits and per_tick are updated
      expect(updatedProfile.resources.max.resource_1).toBe(initialProfile.resources.max.resource_1 + (employeeToHire.resource_max?.resource_1 || 0));
      expect(updatedProfile.resources.per_tick.resource_3).toBe(initialProfile.resources.per_tick.resource_3 + (employeeToHire.income_per_tick?.resource_3 || 0));
    });

    it('should not hire an employee if resources are insufficient', () => {
      initialProfile.resources.current.resource_3 = 0; // Not enough money
      const employeeToHire = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
      const updatedProfile = addAsset(initialProfile, 'asset_group_2', employeeToHire.id, settings);

      // Profile should not change
      expect(updatedProfile).toEqual(initialProfile);
    });

    it('should increment count when hiring an existing employee', () => {
        const employeeToHire = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
        const updatedProfile = addAsset(initialProfile, 'asset_group_2', employeeToHire.id, settings);

        const employeeAsset = updatedProfile.assets.find(a => a.type === 'asset_group_2' && a.id === employeeToHire.id);
        expect(employeeAsset).toBeDefined();
        // Initial count is 1, after hiring one more it should be 2
        expect(employeeAsset!.count).toBe(2);
    });
  });
});