export interface MortalityRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  quantity: number;
  reason?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateMortalityDto {
  houseId: number;
  personnelId?: number;
  date: string;
  quantity: number;
  reason?: string;
  attachmentUrl?: string;
}

export interface FeedWaterRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  feedId?: number;
  feedName?: string;
  feedQuantityKg: number;
  waterQuantityLiters: number;
  createdAt: string;
}

export interface CreateFeedWaterDto {
  houseId: number;
  personnelId?: number;
  date: string;
  feedId?: number;
  feedQuantityKg: number;
  waterQuantityLiters: number;
}

export interface DiseaseRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  diagnosis: string;
  medicine?: string;
  dosage?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateDiseaseDto {
  houseId: number;
  personnelId?: number;
  date: string;
  diagnosis: string;
  medicine?: string;
  dosage?: string;
  attachmentUrl?: string;
}

export interface FileUploadResponse {
  bucket: string;
  fileName: string;
  size: number;
}
