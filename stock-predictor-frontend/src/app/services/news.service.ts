import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private base = `${environment.apiUrl}/api/news`;
  constructor(private http: HttpClient) {}
  getNews(ticker: string) { return this.http.get<any>(`${this.base}/${ticker}`); }
}