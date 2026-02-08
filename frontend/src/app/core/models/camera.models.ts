export interface Camera {
  id: number;
  name: string;
  type: 'RGB' | 'Thermal';
  houseId?: number;
  houseName?: string;
  ipAddress: string;
  port: number;
  username?: string;
  streamPath?: string;
  position: number;
  isActive: boolean;
  constructedRtspUrl: string; // Готовый URL для плеера или AI
}

export interface CreateCameraDto {
  name: string;
  type: 'RGB' | 'Thermal';
  houseId?: number;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  streamPath?: string;
  rtspUrlOverride?: string;
  position: number;
}

export interface UpdateCameraDto extends CreateCameraDto {
  isActive: boolean;
}
