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
    // Encode filename twice? No, Angular/Browser handles basic URI encoding,
    // but we must be careful with slashes in filename (nested folders).
    // MinIO objects like "folder/file.mp4" are just strings.
    // However, in URL path it must be encoded properly.

    // We used {*filePath} in backend which catches slashes.
    // Simply appending it should work if we let browser handle encoding or encode URI component.
    // Backend API: /api/Files/download/{bucket}/{filePath}?access_token=...

    const encodedPath = encodeURIComponent(fileName).replace(/%2F/g, '/'); // Allow slashes for folder structure visually if backend supports it
    // Actually, encodeURIComponent encodes '/' to %2F.
    // .NET route {*filePath} decodes %2F back to /.
    // So encodeURIComponent(fileName) is safer.

    return `${this.API_URL}/download/${bucket}/${fileName}?access_token=${token}`;
  }
}
