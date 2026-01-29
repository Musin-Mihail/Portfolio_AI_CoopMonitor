import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, ClimateHistoryPoint, ComparisonHistory } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Dashboard';

  // Получить список всех
  getAllSummaries(): Observable<DashboardSummary[]> {
    return this.http.get<DashboardSummary[]>(`${this.API_URL}/summary`);
  }

  getSummary(houseId: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API_URL}/summary/${houseId}`);
  }

  getHistory(houseId: number, hours: number = 24, interval: number = 0): Observable<ClimateHistoryPoint[]> {
    let params = new HttpParams().set('hours', hours).set('interval', interval);

    return this.http.get<ClimateHistoryPoint[]>(`${this.API_URL}/history/${houseId}`, { params });
  }

  // НОВЫЙ МЕТОД: Получение данных для сравнения
  getComparisonHistory(
    type: 'temperature' | 'humidity' | 'co2' | 'nh3',
    hours: number = 24,
    interval: number = 60,
  ): Observable<ComparisonHistory[]> {
    let params = new HttpParams().set('type', type).set('hours', hours).set('interval', interval);

    return this.http.get<ComparisonHistory[]>(`${this.API_URL}/history/comparison`, { params });
  }
}
