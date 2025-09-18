import { createNewGameProfile, updateGameProfile, GameProfile } from './game_logic';
import gameSettings from '../game_settings.json';

describe('createNewGameProfile', () => {
  it('should create a new game profile with correct initial values', () => {
    const mockDate = new Date(1672531200000); // 2023-01-01T00:00:00.000Z
    const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const newProfile: GameProfile = createNewGameProfile();

    const expectedCreatedAt = mockDate.toISOString();

    expect(newProfile.resources.money).toBe(gameSettings.initial_resources.money);
    expect(newProfile.employees[0].name).toBe('engineer_level_1');
    expect(newProfile.employees[0].count).toBe(gameSettings.initial_resources.employees.engineer_level_1);
    expect(newProfile.games).toEqual([]);

    // Check resources based on engineer_level_1
    const engineerSettings = gameSettings.engineer_level_1;
    expect(newProfile.resources.creativity).toBe(0);
    expect(newProfile.resources.productivity).toBe(0);
    expect(newProfile.resources.creativity_max).toBe(engineerSettings.creativity_max);
    expect(newProfile.resources.productivity_max).toBe(engineerSettings.productivity_max);
    expect(newProfile.resources.creativity_per_tick).toBe(engineerSettings.creativity_per_tick);
    expect(newProfile.resources.productivity_per_tick).toBe(engineerSettings.productivity_per_tick);
    expect(newProfile.resources.money_per_tick).toBe(0);

    // Check createdAt timestamp
    expect(newProfile.createdAt).toBe(expectedCreatedAt);

    dateSpy.mockRestore();
  });
});

describe('updateGameProfile', () => {
  let initialProfile: GameProfile;

  beforeEach(() => {
    initialProfile = createNewGameProfile();
  });

  it('should not update profile if no ticks have passed', () => {
    const updatedProfile = updateGameProfile(initialProfile, 0);
    expect(updatedProfile).toEqual(initialProfile);
  });

  it('should increase creativity and productivity based on employees and ticks', () => {
    const updatedProfile = updateGameProfile(initialProfile, 3); // 3 ticks

    const engineerSettings = gameSettings.engineer_level_1;
    const expectedCreativity = engineerSettings.creativity_per_tick * 3;
    const expectedProductivity = engineerSettings.productivity_per_tick * 3;

    expect(updatedProfile.resources.creativity).toBe(expectedCreativity);
    expect(updatedProfile.resources.productivity).toBe(expectedProductivity);
  });

  it('should not exceed max creativity and productivity', () => {
    const updatedProfile = updateGameProfile(initialProfile, 100); // a lot of ticks

    expect(updatedProfile.resources.creativity).toBe(initialProfile.resources.creativity_max);
    expect(updatedProfile.resources.productivity).toBe(initialProfile.resources.productivity_max);
  });

  it('should calculate game income and maintenance correctly', () => {
    initialProfile.games.push({ name: 'Novel Game', status: 'released' });
    const updatedProfile = updateGameProfile(initialProfile, 2); // 2 ticks

    const gameData = (gameSettings.developable_games as any).find((g:any) => g.name === 'Novel Game')!;
    const expectedIncome = gameData.income_per_tick * 2;

    const expectedMaintenance = gameData.maintenance_cost_per_tick.productivity * 2;

    const engineerSettings = gameSettings.engineer_level_1;
    const expectedProductivity = (engineerSettings.productivity_per_tick * 2) - expectedMaintenance;

    expect(updatedProfile.resources.money).toBe(initialProfile.resources.money + expectedIncome);
    expect(updatedProfile.resources.productivity).toBe(expectedProductivity);
  });
});
