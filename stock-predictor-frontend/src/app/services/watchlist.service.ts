import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private base = `${environment.apiUrl}/api/watchlist`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any[]>(this.base); }
  add(ticker: string) { return this.http.post<any>(this.base, { ticker }); }
  remove(id: number) { return this.http.delete<any>(`${this.base}/${id}`); }
}