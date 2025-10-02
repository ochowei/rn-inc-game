export interface GameSettings {
  initial: {
    resources: {
      resource_1: number;
      productivity: number;
      money: number;
    };
    assets: {
      [key: string]: number;
    };
  };
  [key: string]: any; // Allow for dynamic employee levels
  gameTickInterval: number;
  developable_games: {
    name: string;
    development_time_ticks: number;
    development_cost: {
      productivity: number;
      resource_1: number;
      funding: number;
    };
    income_per_tick: number;
    maintenance_cost_per_tick: {
      productivity: number;
    };
  }[];
}

export interface Game {
  name: string;
  status: 'developing' | 'completed';
  development_progress_ticks: number;
}

export interface SaveProfile {
  resources: {
    resource_1: number;
    productivity: number;
    resource_1_max: number;
    productivity_max: number;
    money: number;
    resource_1_per_tick: number;
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