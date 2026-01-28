export interface UserDto {
  id: string;
  userName: string;
  email: string;
  role: string;
  personnelId?: number;
  personnelName?: string;
}

export interface CreateUserDto {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  userName: string;
  email: string;
  password?: string; // Optional on update
  role: string;
}

export interface AuditLogDto {
  id: number;
  userId?: string;
  userName?: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
