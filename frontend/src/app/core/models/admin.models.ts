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
