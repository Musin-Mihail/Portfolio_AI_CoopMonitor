import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { House, CreateHouseDto } from '../models/master-data.models';

@Injectable({
  providedIn: 'root',
})
export class HousesService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Houses';
  private readonly IMPORT_URL = '/api/DataImport';

  getHouses(): Observable<House[]> {
    return this.http.get<House[]>(this.API_URL);
  }

  getHouse(id: number): Observable<House> {
    return this.http.get<House>(`${this.API_URL}/${id}`);
  }

  createHouse(house: CreateHouseDto): Observable<House> {
    return this.http.post<House>(this.API_URL, house);
  }

  updateHouse(id: number, house: CreateHouseDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, house);
  }

  deleteHouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  importData(houseId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.IMPORT_URL}/upload/${houseId}`, formData);
  }
}
