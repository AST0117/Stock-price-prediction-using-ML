import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private base = 'http://localhost:5000/api/news';
  constructor(private http: HttpClient) {}
  getNews(ticker: string) { return this.http.get<any>(`${this.base}/${ticker}`); }
}