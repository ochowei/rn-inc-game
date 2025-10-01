import { createNewSaveProfile, updateSaveProfile, developGame, Game, SaveProfile } from './game_logic';
import gameSettings from '../settings.json';

describe('createNewSaveProfile', () => {
  it('should create a new save profile with correct initial values', () => {
    const mockDate = new Date(1672531200000); // 2023-01-01T00:00:00.000Z
    const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const newProfile: SaveProfile = createNewSaveProfile();

    const expectedCreatedAt = mockDate.toISOString();

    expect(newProfile.resources.money).toBe(gameSettings.initial.resources.money);
    expect(newProfile.employees[0].name).toBe('engineer_level_1');
    expect(newProfile.employees[0].count).toBe(gameSettings.initial.assets.engineer_level_1);
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

describe('updateSaveProfile', () => {
  let initialProfile: SaveProfile;

  beforeEach(() => {
    initialProfile = createNewSaveProfile();
  });

  it('should not update profile if no ticks have passed', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 0);
    expect(updatedProfile).toEqual(initialProfile);
  });

  it('should increase creativity and productivity based on employees and ticks', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 3); // 3 ticks

    const engineerSettings = gameSettings.engineer_level_1;
    const expectedCreativity = engineerSettings.creativity_per_tick * 3;
    const expectedProductivity = engineerSettings.productivity_per_tick * 3;

    expect(updatedProfile.resources.creativity).toBe(expectedCreativity);
    expect(updatedProfile.resources.productivity).toBe(expectedProductivity);
  });

  it('should not exceed max creativity and productivity', () => {
    const updatedProfile = updateSaveProfile(initialProfile, 100); // a lot of ticks

    expect(updatedProfile.resources.creativity).toBe(initialProfile.resources.creativity_max);
    expect(updatedProfile.resources.productivity).toBe(initialProfile.resources.productivity_max);
  });

  it('should calculate game income and maintenance correctly for completed games', () => {
    initialProfile.games.push({ name: 'Novel Game', status: 'completed', development_progress_ticks: 6 });
    const updatedProfile = updateSaveProfile(initialProfile, 2); // 2 ticks

    const gameData = gameSettings.developable_games.find((g) => g.name === 'Novel Game')!;
    const expectedIncome = gameData.income_per_tick * 2;

    const expectedMaintenance = gameData.maintenance_cost_per_tick.productivity * 2;

    const engineerSettings = gameSettings.engineer_level_1;
    const expectedProductivity = (engineerSettings.productivity_per_tick * 2) - expectedMaintenance;

    expect(updatedProfile.resources.money).toBe(initialProfile.resources.money + expectedIncome);
    expect(updatedProfile.resources.productivity).toBe(expectedProductivity);
  });
});

describe('developGame', () => {
  let initialProfile: SaveProfile;

  beforeEach(() => {
    initialProfile = createNewSaveProfile();
    // Give player enough resources for testing
    initialProfile.resources.money = 100;
    initialProfile.resources.creativity = 100;
    initialProfile.resources.productivity = 100;
  });

  it('should start developing a game if resources are sufficient', () => {
    const gameToDevelop = gameSettings.developable_games[0];
    const updatedProfile = developGame(initialProfile, gameToDevelop.name);

    // Check if costs are deducted
    expect(updatedProfile.resources.money).toBe(initialProfile.resources.money - gameToDevelop.development_cost.funding);
    expect(updatedProfile.resources.creativity).toBe(initialProfile.resources.creativity - gameToDevelop.development_cost.creativity);
    expect(updatedProfile.resources.productivity).toBe(initialProfile.resources.productivity - gameToDevelop.development_cost.productivity);

    // Check if game is added to profile with 'developing' status
    expect(updatedProfile.games.length).toBe(1);
    expect(updatedProfile.games[0].name).toBe(gameToDevelop.name);
    expect(updatedProfile.games[0].status).toBe('developing');
    expect(updatedProfile.games[0].development_progress_ticks).toBe(0);
  });

  it('should not develop a game if resources are insufficient', () => {
    initialProfile.resources.money = 0; // Not enough money
    const gameToDevelop = gameSettings.developable_games[0];
    const updatedProfile = developGame(initialProfile, gameToDevelop.name);

    // Profile should not change
    expect(updatedProfile).toEqual(initialProfile);
  });

  it('should not develop a game that is already owned or in development', () => {
    const gameToDevelop = gameSettings.developable_games[0];
    // First, successfully start development
    const profileWithGame = developGame(initialProfile, gameToDevelop.name);
    // Then, try to develop it again
    const updatedProfile = developGame(profileWithGame, gameToDevelop.name);

    // Profile should not change
    expect(updatedProfile).toEqual(profileWithGame);
  });

  it('should progress game development over ticks', () => {
    const gameToDevelop = gameSettings.developable_games[0];
    let profile = developGame(initialProfile, gameToDevelop.name);

    // Update profile by a few ticks
    profile = updateSaveProfile(profile, 2);

    expect(profile.games[0].status).toBe('developing');
    expect(profile.games[0].development_progress_ticks).toBe(2);
  });

  it('should complete game development and start generating income', () => {
    const gameToDevelop = gameSettings.developable_games[0];
    let profile = developGame(initialProfile, gameToDevelop.name);

    const developmentTime = gameToDevelop.development_time_ticks;
    const initialMoney = profile.resources.money;

    // Update profile until the game is developed
    profile = updateSaveProfile(profile, developmentTime);

    // Check if game is completed
    expect(profile.games[0].status).toBe('completed');
    expect(profile.games[0].development_progress_ticks).toBe(developmentTime);

    // Now, update profile by one more tick to see if income is generated
    const profileAfterCompletion = updateSaveProfile(profile, 1);

    const moneyBeforeIncome = profile.resources.money;
    const productivityBeforeIncome = profile.resources.productivity;

    // Recalculate expected income and productivity changes
    const expectedIncome = gameToDevelop.income_per_tick * 1;
    const expectedMaintenance = gameToDevelop.maintenance_cost_per_tick.productivity * 1;
    const engineerSettings = gameSettings.engineer_level_1;
    const productivityFromEmployees = engineerSettings.productivity_per_tick * 1;

    const expectedProductivity = Math.min(profile.resources.productivity_max, productivityBeforeIncome + productivityFromEmployees) - expectedMaintenance;

    // Check for income
    expect(profileAfterCompletion.resources.money).toBe(moneyBeforeIncome + expectedIncome);
    // Check for productivity change
    expect(profileAfterCompletion.resources.productivity).toBe(expectedProductivity);
  });

  it('should correctly handle income for completed games only', () => {
      const gameToDevelop = gameSettings.developable_games[0];
      let profile = developGame(initialProfile, gameToDevelop.name);
      const moneyBeforeUpdate = profile.resources.money;

      // Game is developing, not completed. Update by 1 tick.
      const profileWhileDeveloping = updateSaveProfile(profile, 1);

      // Money should NOT have changed from income.
      // The only change should be from employee generation, which is 0 for money.
      expect(profileWhileDeveloping.resources.money).toBe(moneyBeforeUpdate);
  });
});
