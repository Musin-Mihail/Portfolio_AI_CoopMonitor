import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  // Сигнал для реактивного отслеживания состояния авторизации
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/Auth/login', { username, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
