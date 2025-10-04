import { createNewSaveProfile, updateSaveProfile, addAsset } from './game_engine';
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

  it('should not exceed max resources', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 100, settings); // a lot of ticks

    expect(updatedProfile.resources.current.resource_1).toBe(initialProfile.resources.max.resource_1);
    expect(updatedProfile.resources.current.resource_2).toBe(initialProfile.resources.max.resource_2);
  });

  it('should calculate game income and maintenance correctly for completed games', () => {
    initialProfile.assets.push({
      type: 'asset_group_1',
      id: 'novel_game',
      development_progress_ticks: 6,
      count: 1,
    });
    const updatedProfile = updateSaveProfile(initialProfile, 2, settings); // 2 ticks

    const gameData = settings.assets_group_1.assets.find((g) => g.id === 'novel_game')!;
    const expectedIncome = gameData.income_per_tick.resource_3 * 2;
    const expectedMaintenance = (gameData.maintenance_cost_per_tick?.resource_2 || 0) * 2;

    const engineerData = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
    const { income_per_tick } = engineerData!;
    const expectedResource2FromEmployees = (income_per_tick!.resource_2 || 0) * 2;
    const initialResource2 = initialProfile.resources.current.resource_2;

    const expectedResource2 = initialResource2 + expectedResource2FromEmployees - expectedMaintenance;

    expect(updatedProfile.resources.current.resource_3).toBe(initialProfile.resources.current.resource_3 + expectedIncome);
    expect(updatedProfile.resources.current.resource_2).toBe(expectedResource2);
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