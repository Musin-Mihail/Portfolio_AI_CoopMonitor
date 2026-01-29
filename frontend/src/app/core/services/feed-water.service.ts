import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedWaterRecord, CreateFeedWaterDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class FeedWaterService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/FeedWater';

  getRecords(houseId?: number, startDate?: string, endDate?: string): Observable<FeedWaterRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<FeedWaterRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateFeedWaterDto): Observable<FeedWaterRecord> {
    return this.http.post<FeedWaterRecord>(this.API_URL, dto);
  }

  updateRecord(id: number, dto: CreateFeedWaterDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, dto);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
