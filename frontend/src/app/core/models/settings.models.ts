export interface SystemStatus {
  appVersion: string;
  environment: string;
  serverTimeUtc: string;
  saaS: SaaSStatus;
  notifications: NotificationStatus;
}

export interface SaaSStatus {
  isConnected: boolean;
  dailyUsageBytes: number;
  dailyLimitBytes: number;
  usagePercent: number;
  lastSync?: string;
}

export interface NotificationStatus {
  telegramEnabled: boolean;
  adminChatId?: string;
}
