import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileMetadata } from '../models/file.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = '/api/Files';

  listFiles(bucket: string, prefix?: string): Observable<FileMetadata[]> {
    let params = new HttpParams();
    if (prefix) params = params.set('prefix', prefix);

    return this.http.get<FileMetadata[]>(`${this.API_URL}/list/${bucket}`, { params });
  }

  /**
   * Generates a streaming URL with auth token for HTML5 video player
   */
  getStreamUrl(bucket: string, fileName: string): string {
    const token = this.authService.getToken();
    const encodedPath = encodeURIComponent(fileName).replace(/%2F/g, '/');

    return `${this.API_URL}/download/${bucket}/${encodedPath}?access_token=${token}`;
  }
}
