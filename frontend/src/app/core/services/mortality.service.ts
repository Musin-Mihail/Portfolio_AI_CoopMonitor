import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MortalityRecord, CreateMortalityDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class MortalityService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Mortality';

  getRecords(houseId?: number, date?: string): Observable<MortalityRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (date) params = params.set('date', date);

    return this.http.get<MortalityRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateMortalityDto): Observable<MortalityRecord> {
    return this.http.post<MortalityRecord>(this.API_URL, dto);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
