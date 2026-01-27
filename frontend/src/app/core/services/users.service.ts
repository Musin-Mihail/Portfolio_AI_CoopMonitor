import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, CreateUserDto } from '../models/admin.models';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Users';

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.API_URL);
  }

  createUser(dto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.API_URL, dto);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
