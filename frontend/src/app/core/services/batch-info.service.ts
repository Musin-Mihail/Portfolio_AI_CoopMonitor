import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BatchInfoRecord, CreateBatchInfoDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class BatchInfoService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/BatchInfo';

  getRecords(houseId?: number, date?: string): Observable<BatchInfoRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (date) params = params.set('date', date);

    return this.http.get<BatchInfoRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateBatchInfoDto): Observable<BatchInfoRecord> {
    return this.http.post<BatchInfoRecord>(this.API_URL, dto);
  }

  updateRecord(id: number, dto: CreateBatchInfoDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, dto);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
