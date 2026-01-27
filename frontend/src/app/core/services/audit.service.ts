import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogDto } from '../models/admin.models';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Audit';

  getLogs(limit: number = 100): Observable<AuditLogDto[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AuditLogDto[]>(this.API_URL, { params });
  }
}
