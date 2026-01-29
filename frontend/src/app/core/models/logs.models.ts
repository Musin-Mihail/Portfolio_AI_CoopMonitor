export interface MortalityRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  quantity: number;
  reason?: string;
  birdIdentifier?: string;
  circumstances?: string;
  vetComment?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateMortalityDto {
  houseId: number;
  personnelId?: number;
  date: string;
  quantity: number;
  reason?: string;
  birdIdentifier?: string;
  circumstances?: string;
  vetComment?: string;
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
  birdIdentifier?: string;
  medicine?: string;
  comments?: string;
  createdAt: string;
}

export interface CreateFeedWaterDto {
  houseId: number;
  personnelId?: number;
  date: string;
  feedId?: number;
  feedQuantityKg: number;
  waterQuantityLiters: number;
  birdIdentifier?: string;
  medicine?: string;
  comments?: string;
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

export interface WeighingRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  weightGrams: number;
  isMusicPlayed: boolean;
  videoUrl: string;
  birdIdentifier?: string;
  temperature?: number;
  updateMarking: boolean;
  symptoms?: string;
  actions?: string;
  vetPrescriptions?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateWeighingDto {
  houseId: number;
  personnelId?: number;
  date: string;
  weightGrams: number;
  isMusicPlayed: boolean;
  birdIdentifier?: string;
  temperature?: number;
  updateMarking: boolean;
  symptoms?: string;
  actions?: string;
  vetPrescriptions?: string;
  notes?: string;
  videoFile: File;
}

export interface MarkingRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  birdAgeDays: number;
  birdIdentifier?: string;
  markingType: string;
  color?: string;
  ringNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateMarkingDto {
  houseId: number;
  personnelId?: number;
  date: string;
  birdAgeDays: number;
  birdIdentifier?: string;
  markingType: string;
  color?: string;
  ringNumber?: string;
  notes?: string;
  photoFile?: File;
}

export interface BatchInfoRecord {
  id: number;
  houseId: number;
  houseName?: string;
  personnelId?: number;
  personnelName?: string;
  date: string;
  quantity: number;
  birdAgeDays: number;
  createdAt: string;
}

export interface CreateBatchInfoDto {
  houseId: number;
  personnelId?: number;
  date: string;
  quantity: number;
  birdAgeDays: number;
}
