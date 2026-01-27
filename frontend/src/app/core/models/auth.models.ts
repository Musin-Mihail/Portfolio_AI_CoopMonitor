export interface LoginResponse {
  token: string;
  expiration: string;
}

export interface User {
  username: string;
  roles: string[];
}
