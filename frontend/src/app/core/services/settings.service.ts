import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemStatus } from '../models/settings.models';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Settings';

  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.API_URL}/status`);
  }
}
