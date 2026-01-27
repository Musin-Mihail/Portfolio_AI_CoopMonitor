export interface House {
  id: number;
  name: string;
  area: number;
  capacity: number;
  configurationJson?: string;
  createdAt: string;
}

export interface CreateHouseDto {
  name: string;
  area: number;
  capacity: number;
  configurationJson?: string;
}

export interface Personnel {
  id: number;
  fullName: string;
  jobTitle?: string;
  phoneNumber?: string;
  email?: string;
  userId?: string;
  isActive: boolean;
}

export interface CreatePersonnelDto {
  fullName: string;
  jobTitle?: string;
  phoneNumber?: string;
  email?: string;
  userId?: string;
}

export interface Feed {
  id: number;
  name: string;
  type: string;
  description?: string;
}

export interface CreateFeedDto {
  name: string;
  type: string;
  description?: string;
}
