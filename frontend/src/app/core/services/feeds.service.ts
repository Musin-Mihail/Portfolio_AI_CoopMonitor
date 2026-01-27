import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feed, CreateFeedDto } from '../models/master-data.models';

@Injectable({
  providedIn: 'root',
})
export class FeedsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Feeds';

  getFeeds(): Observable<Feed[]> {
    return this.http.get<Feed[]>(this.API_URL);
  }

  getFeed(id: number): Observable<Feed> {
    return this.http.get<Feed>(`${this.API_URL}/${id}`);
  }

  createFeed(feed: CreateFeedDto): Observable<Feed> {
    return this.http.post<Feed>(this.API_URL, feed);
  }

  updateFeed(id: number, feed: CreateFeedDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, feed);
  }

  deleteFeed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
