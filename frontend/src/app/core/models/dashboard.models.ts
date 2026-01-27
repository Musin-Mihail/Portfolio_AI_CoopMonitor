export interface DashboardSummary {
  houseId: number;
  houseName: string;
  dayOfCycle: number;
  todayMetrics: DailyMetrics;
  currentClimate: CurrentClimate;
  activeAlerts: string[];
}

export interface DailyMetrics {
  mortalityCount: number;
  mortalityRatePercent: number;
  feedConsumedKg: number;
  waterConsumedLiters: number;
  estimatedADG?: number;
}

export interface CurrentClimate {
  temperature: number;
  humidity: number;
  co2: number;
  nh3: number;
  timeInRangePercent: number;
  lastUpdate: string;
}
