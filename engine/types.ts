export interface GameSettings {
  initial: {
    resources: {
      resource_1: number;
      resource_2: number;
      resource_3: number;
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
      resource_2: number;
      resource_1: number;
      resource_3: number;
    };
    income_per_tick: number;
    maintenance_cost_per_tick: {
      resource_2: number;
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
    resource_2: number;
    resource_1_max: number;
    resource_2_max: number;
    resource_3: number;
    resource_1_per_tick: number;
    resource_2_per_tick: number;
    resource_3_per_tick: number;
  };
  employees: {
    name: string;
    count: number;
  }[];
  games: Game[];
  createdAt: string;
}