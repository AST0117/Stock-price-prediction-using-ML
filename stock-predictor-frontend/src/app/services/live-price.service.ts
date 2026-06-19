import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LivePriceService {
  private base = 'http://localhost:5000/api/stock';

  constructor(private http: HttpClient) {}

  getPrice(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/${ticker}/price`);
  }
}