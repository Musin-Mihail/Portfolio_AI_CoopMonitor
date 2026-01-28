import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadResponse } from '../models/logs.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Inject AuthService
  private readonly API_URL = '/api/Files/upload';
  private readonly DOWNLOAD_API_URL = '/api/Files/download';

  uploadFile(file: File, bucket: string = 'user-uploads'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    return this.http.post<FileUploadResponse>(this.API_URL, formData);
  }

  /**
   * Generates a URL for viewing/downloading that includes the Auth Token.
   * Required for <a> tags, window.open(), and <video> src attributes.
   */
  getDownloadUrl(bucket: string, filePath: string): string {
    const token = this.authService.getToken();
    // Encode path components to handle spaces/special chars safely
    const encodedBucket = encodeURIComponent(bucket);
    // filePath might contain slashes (folders), we want to preserve them but encode segments
    const encodedPath = filePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${this.DOWNLOAD_API_URL}/${encodedBucket}/${encodedPath}?access_token=${token}`;
  }
}
