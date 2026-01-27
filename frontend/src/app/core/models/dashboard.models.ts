export interface DashboardSummary {
  houseId: number;
  houseName: string;
  dayOfCycle: number;
  todayMetrics: DailyMetrics;
  currentClimate: CurrentClimate;
  audioStatus: AudioStatus;
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

export interface AudioStatus {
  status: 'Healthy' | 'Warning' | 'Unknown';
  lastClassification: string;
  lastUpdate: string;
}

export interface ClimateHistoryPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  co2: number;
  nh3: number;
}
