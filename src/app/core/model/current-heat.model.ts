export interface CurrentHeatModel {
  event: number;
  heat: number;
  distance: number;
  laps: number;
  style: string;
  runningTime: number;
  competitors: Map<number, Competitor>;
}

export interface Competitor {
  lane: number;
  first_name: string;
  last_name: string;
  team: string;
  lap: number;
  lapM: number;
  splits: Map<number, number>;
}
