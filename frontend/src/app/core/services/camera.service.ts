import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camera, CreateCameraDto, UpdateCameraDto } from '../models/camera.models';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Cameras';

  getCameras(): Observable<Camera[]> {
    return this.http.get<Camera[]>(this.API_URL);
  }

  getCamera(id: number): Observable<Camera> {
    return this.http.get<Camera>(`${this.API_URL}/${id}`);
  }

  createCamera(dto: CreateCameraDto): Observable<Camera> {
    return this.http.post<Camera>(this.API_URL, dto);
  }

  updateCamera(id: number, dto: UpdateCameraDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, dto);
  }

  deleteCamera(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
