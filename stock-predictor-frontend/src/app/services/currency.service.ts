import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private base = 'http://localhost:5000/api/currency';
  constructor(private http: HttpClient) {}

  convert(amount: number, from: string, to: string) {
    return this.http.get<any>(`${this.base}/convert?amount=${amount}&from=${from}&to=${to}`);
  }
  listCurrencies() {
    return this.http.get<any>(`${this.base}/list`);
  }
}