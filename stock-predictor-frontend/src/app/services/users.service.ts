import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.base);
  }

  create(user: any): Observable<any> {
    return this.http.post(this.base, user);
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}