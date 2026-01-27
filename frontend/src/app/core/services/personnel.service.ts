import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personnel, CreatePersonnelDto } from '../models/master-data.models';

@Injectable({
  providedIn: 'root',
})
export class PersonnelService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Personnels';

  getPersonnels(): Observable<Personnel[]> {
    return this.http.get<Personnel[]>(this.API_URL);
  }

  getPersonnel(id: number): Observable<Personnel> {
    return this.http.get<Personnel>(`${this.API_URL}/${id}`);
  }

  createPersonnel(personnel: CreatePersonnelDto): Observable<Personnel> {
    return this.http.post<Personnel>(this.API_URL, personnel);
  }

  updatePersonnel(id: number, personnel: Personnel): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, personnel);
  }

  deletePersonnel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
