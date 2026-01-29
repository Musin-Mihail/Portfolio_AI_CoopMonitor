import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarkingRecord, CreateMarkingDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class MarkingService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Marking';

  getRecords(houseId?: number, startDate?: string, endDate?: string): Observable<MarkingRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<MarkingRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateMarkingDto): Observable<MarkingRecord> {
    const formData = this.createFormData(dto);
    return this.http.post<MarkingRecord>(this.API_URL, formData);
  }

  updateRecord(id: number, dto: CreateMarkingDto): Observable<void> {
    const formData = this.createFormData(dto);
    return this.http.put<void>(`${this.API_URL}/${id}`, formData);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private createFormData(dto: CreateMarkingDto): FormData {
    const formData = new FormData();
    formData.append('houseId', dto.houseId.toString());
    if (dto.personnelId) formData.append('personnelId', dto.personnelId.toString());
    formData.append('date', dto.date);
    formData.append('birdAgeDays', dto.birdAgeDays.toString());
    if (dto.birdIdentifier) formData.append('birdIdentifier', dto.birdIdentifier);
    formData.append('markingType', dto.markingType);
    if (dto.color) formData.append('color', dto.color);
    if (dto.ringNumber) formData.append('ringNumber', dto.ringNumber);
    if (dto.notes) formData.append('notes', dto.notes);

    if (dto.photoFile) {
      formData.append('photoFile', dto.photoFile);
    }
    return formData;
  }
}
