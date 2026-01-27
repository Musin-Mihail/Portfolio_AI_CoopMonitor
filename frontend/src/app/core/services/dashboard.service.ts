import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Dashboard';

  getSummary(houseId: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API_URL}/summary/${houseId}`);
  }
}
