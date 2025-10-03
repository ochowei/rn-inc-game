export interface ResourceGroup {
  resource_1: number;
  resource_2: number;
  resource_3: number;
}

export interface Asset {
  id: string;
  name: string;
  time_cost_ticks: number;
  cost: ResourceGroup;
  income_per_tick: ResourceGroup;
  maintenance_cost_per_tick?: ResourceGroup;
  resource_max?: ResourceGroup;
}

export interface GameSettings {
  initial: {
    resources: ResourceGroup;
    assets: {
      [key: string]: number;
    };
  };
  gameTickInterval: number;
  assets_group_1: {
    name: string;
    assets: Asset[];
  };
  assets_group_2: {
    name:string;
    assets: Asset[];
  };
  [key: string]: any; // Allow for other dynamic properties
}

export interface Game {
  name: string;
  status: 'developing' | 'completed';
  development_progress_ticks: number;
}

export interface SaveProfile {
  resources: {
    current: ResourceGroup;
    max: ResourceGroup;
    per_tick: ResourceGroup;
  };
  employees: {
    name: string;
    count: number;
  }[];
  games: Game[];
  createdAt: string;
}