import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateReportRequest, ReportMetadata } from '../models/reports.models';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Reports';

  getReports(houseId?: number, type?: string, date?: string): Observable<ReportMetadata[]> {
    let params = new HttpParams();
    if (houseId) params = params.set('houseId', houseId);
    if (type) params = params.set('type', type);
    if (date) params = params.set('date', date);

    return this.http.get<ReportMetadata[]>(this.API_URL, { params });
  }

  /**
   * Downloads the report as a Blob.
   * Required because direct links don't include the Auth Header.
   */
  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/download/${id}`, {
      responseType: 'blob',
    });
  }

  triggerGeneration(request: GenerateReportRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/generate`, request);
  }
}
