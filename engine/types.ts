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

export interface ContainerType {
  id: string;
  name: string;
  cost: { resource_id: keyof ResourceGroup; amount: number }[];
  capacities: { [asset_group_id: string]: number };
}

export interface GameSettings {
  initial: {
    resources: ResourceGroup;
    assets: {
      [key: string]: number;
    };
  };
  gameTickInterval: number;
  unlimited_resources: string[];
  assets_group_1: {
    name: string;
    assets: Asset[];
  };
  assets_group_2: {
    name: string;
    assets: Asset[];
  };
  container_types: ContainerType[];
  [key: string]: any; // Allow for other dynamic properties
}

export type AcquiredAsset = {
  type: 'asset_group_1' | 'asset_group_2';
  id: string;
  count: number;
  development_progress_ticks: number;
};
export type InProgressAsset = {
  type: 'asset_group_1' | 'asset_group_2';
  id: string;
  status: 'in_progress' | 'completed';
  start_time: Date;
  development_progress_ticks: number;
};

export interface OwnedContainer {
  id: string;
  typeId: string;
}

export interface SaveProfile {
  resources: {
    current: ResourceGroup;
    max: ResourceGroup;
    per_tick: ResourceGroup;
  };
  assets: AcquiredAsset[];
  inProgressAssets: InProgressAsset[];
  owned_containers: OwnedContainer[];
  createdAt: string;
}