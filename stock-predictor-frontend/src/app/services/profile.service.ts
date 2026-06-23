import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = `${environment.apiUrl}/api/profile`;

  constructor(private http: HttpClient) {}

  get(): Observable<any> {
    return this.http.get(this.base);
  }

  update(data: any): Observable<any> {
    return this.http.put(this.base, data);
  }

  remove(): Observable<any> {
    return this.http.delete(this.base);
  }
}