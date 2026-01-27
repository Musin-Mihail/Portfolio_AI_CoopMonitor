import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadResponse } from '../models/logs.models';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Files/upload';

  uploadFile(file: File, bucket: string = 'user-uploads'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    return this.http.post<FileUploadResponse>(this.API_URL, formData);
  }

  /**
   * Helper to format the full URL for viewing/downloading if needed.
   * Currently backend returns path relative to bucket, frontend might need to prefix API proxy.
   */
  getDownloadUrl(bucket: string, filePath: string): string {
    // Encodes the file path to handle slashes correctly in the URL segment
    return `/api/Files/download/${bucket}/${filePath}`;
  }
}
