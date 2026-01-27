import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, ClimateHistoryPoint } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Dashboard';

  getSummary(houseId: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API_URL}/summary/${houseId}`);
  }

  getHistory(houseId: number, hours: number = 24): Observable<ClimateHistoryPoint[]> {
    const params = new HttpParams().set('hours', hours);
    return this.http.get<ClimateHistoryPoint[]>(`${this.API_URL}/history/${houseId}`, { params });
  }
}
