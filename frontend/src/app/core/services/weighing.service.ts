import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeighingRecord, CreateWeighingDto } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class WeighingService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Weighing';

  getRecords(houseId?: number, date?: string): Observable<WeighingRecord[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (date) params = params.set('date', date);

    return this.http.get<WeighingRecord[]>(this.API_URL, { params });
  }

  createRecord(dto: CreateWeighingDto): Observable<WeighingRecord> {
    const formData = new FormData();
    formData.append('houseId', dto.houseId.toString());
    if (dto.personnelId) formData.append('personnelId', dto.personnelId.toString());
    formData.append('date', dto.date);
    formData.append('weightGrams', dto.weightGrams.toString());
    formData.append('isMusicPlayed', String(dto.isMusicPlayed));
    formData.append('videoFile', dto.videoFile);

    return this.http.post<WeighingRecord>(this.API_URL, formData);
  }

  // NOTE: For updates, if video is not changed, logic differs slightly.
  // Ideally backend should accept nullable videoFile on Update.
  // This assumes we might not send a new video file.
  updateRecord(id: number, dto: Partial<CreateWeighingDto> & { videoFile?: File }): Observable<void> {
    const formData = new FormData();
    if (dto.houseId) formData.append('houseId', dto.houseId.toString());
    if (dto.personnelId) formData.append('personnelId', dto.personnelId.toString());
    if (dto.date) formData.append('date', dto.date);
    if (dto.weightGrams) formData.append('weightGrams', dto.weightGrams.toString());
    if (dto.isMusicPlayed !== undefined) formData.append('isMusicPlayed', String(dto.isMusicPlayed));

    if (dto.videoFile) {
      formData.append('videoFile', dto.videoFile);
    }

    return this.http.put<void>(`${this.API_URL}/${id}`, formData);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
