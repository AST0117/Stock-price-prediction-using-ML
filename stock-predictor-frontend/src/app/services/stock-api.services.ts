import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockApiService {
  private base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getHistory(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/stock/${ticker}/history`);
  }

  getLinear(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/predict/linear/${ticker}`);
  }

  getArima(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/predict/arima/${ticker}`);
  }

  getLstm(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/predict/lstm/${ticker}`);
  }

  getSentiment(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/sentiment/${ticker}`);
  }

  getRecommendation(ticker: string): Observable<any> {
    return this.http.get(`${this.base}/recommend/${ticker}`);
  }

  getAll(ticker: string): Observable<any> {
    return forkJoin({
      history: this.getHistory(ticker),
      // linear: this.getLinear(ticker),
      // arima: this.getArima(ticker),
      // lstm: this.getLstm(ticker),
      // sentiment: this.getSentiment(ticker),
      recommendation: this.getRecommendation(ticker)
    });
  }
  
}