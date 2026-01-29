import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiseaseRecord, CreateDiseaseDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class DiseaseService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Disease';

  getRecords(houseId?: number, startDate?: string, endDate?: string): Observable<DiseaseRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<DiseaseRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateDiseaseDto): Observable<DiseaseRecord> {
    return this.http.post<DiseaseRecord>(this.API_URL, dto);
  }

  updateRecord(id: number, dto: CreateDiseaseDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, dto);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
