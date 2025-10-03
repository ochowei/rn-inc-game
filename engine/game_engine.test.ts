import { createNewSaveProfile, updateSaveProfile, developGame } from './game_engine';
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
    const engineerAsset = newProfile.assets.find(a => a.type === 'employee' && a.id === 'engineer_level_1');
    expect(engineerAsset).toBeDefined();
    // @ts-ignore
    expect(engineerAsset?.count).toBe(settings.initial.assets.engineer_level_1);
    const gameAssets = newProfile.assets.filter(a => a.type === 'game');
    expect(gameAssets.length).toBe(0);

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
    initialProfile.assets.push({ type: 'game', id: 'novel_game', status: 'completed', development_progress_ticks: 6 });
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
});

describe('developGame', () => {
  let initialProfile: SaveProfile;

  beforeEach(() => {
    initialProfile = createNewSaveProfile(settings);
    // Give player enough resources for testing
    initialProfile.resources.current.resource_1 = 100;
    initialProfile.resources.current.resource_2 = 100;
    initialProfile.resources.current.resource_3 = 100;
  });

  it('should start developing a game if resources are sufficient', () => {
    const gameToDevelop = settings.assets_group_1.assets[0];
    const updatedProfile = developGame(initialProfile, gameToDevelop.id, settings);

    // Check if costs are deducted
    expect(updatedProfile.resources.current.resource_1).toBe(initialProfile.resources.current.resource_1 - gameToDevelop.cost.resource_1);
    expect(updatedProfile.resources.current.resource_2).toBe(initialProfile.resources.current.resource_2 - gameToDevelop.cost.resource_2);
    expect(updatedProfile.resources.current.resource_3).toBe(initialProfile.resources.current.resource_3 - gameToDevelop.cost.resource_3);

    // Check if game is added to profile with 'developing' status
    const gameAsset = updatedProfile.assets.find(a => a.type === 'game' && a.id === gameToDevelop.id);
    expect(gameAsset).toBeDefined();
    // @ts-ignore
    expect(gameAsset.status).toBe('developing');
  });

  it('should not develop a game if resources are insufficient', () => {
    initialProfile.resources.current.resource_3 = 0; // Not enough money
    const gameToDevelop = settings.assets_group_1.assets[0];
    const updatedProfile = developGame(initialProfile, gameToDevelop.id, settings);

    // Profile should not change
    expect(updatedProfile).toEqual(initialProfile);
  });

  it('should progress game development over ticks', () => {
    const gameToDevelop = settings.assets_group_1.assets[0];
    let profile = developGame(initialProfile, gameToDevelop.id, settings);

    // Update profile by a few ticks
    profile = updateSaveProfile(profile, 2, settings);

    const gameAsset = profile.assets.find(a => a.type === 'game' && a.id === gameToDevelop.id);
    expect(gameAsset).toBeDefined();
    // @ts-ignore
    expect(gameAsset.status).toBe('developing');
    // @ts-ignore
    expect(gameAsset.development_progress_ticks).toBe(2);
  });

  it('should complete game development and start generating income', () => {
    const gameToDevelop = settings.assets_group_1.assets[0];
    let profile = developGame(initialProfile, gameToDevelop.id, settings);

    const developmentTime = gameToDevelop.time_cost_ticks;

    // Update profile until the game is developed
    profile = updateSaveProfile(profile, developmentTime, settings);
    const gameAsset = profile.assets.find(a => a.type === 'game' && a.id === gameToDevelop.id);
    // @ts-ignore
    expect(gameAsset.status).toBe('completed');

    // Now, update profile by one more tick to see if income is generated
    const profileAfterCompletion = updateSaveProfile(profile, 1, settings);

    const expectedIncome = gameToDevelop.income_per_tick.resource_3 * 1;
    const expectedMaintenance = (gameToDevelop.maintenance_cost_per_tick?.resource_2 || 0) * 1;

    const engineerData = settings.assets_group_2.assets.find(e => e.id === 'engineer_level_1')!;
    const { income_per_tick } = engineerData!;
    const resource2FromEmployees = (income_per_tick!.resource_2 || 0) * 1;

    const resource3BeforeIncome = profile.resources.current.resource_3;
    const resource2BeforeIncome = profile.resources.current.resource_2;

    const expectedResource3 = resource3BeforeIncome + expectedIncome;
    const resource2AfterEmployees = Math.min(profile.resources.max.resource_2, resource2BeforeIncome + resource2FromEmployees);
    const expectedResource2 = resource2AfterEmployees - expectedMaintenance;

    expect(profileAfterCompletion.resources.current.resource_3).toBe(expectedResource3);
    expect(profileAfterCompletion.resources.current.resource_2).toBe(expectedResource2);
  });
});