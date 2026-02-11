import { Injectable } from '@angular/core';
import { of, delay, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl + 'auth';

  constructor(private http: HttpClient) {}
  
  login(payload: { email: string; password: string }): Observable<{ message: string; user: { id: string; fullName: string; email: string; shops: any[] }}> {
    console.log('AuthService.login payload', payload);
     return this.http.post<any>(`${this.apiUrl}/login`, payload, { withCredentials: true });
    //return of({ message: 'Login successful', user: { id: 'mock-user-id', fullName: 'Mock User', email: payload.email, shops: [] }}).pipe(delay(800));
  }

  register(payload: {
    role: 'BUYER' | 'SHOP';
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Observable<any> {
    console.log('AuthService.register payload', payload);
    return this.http.post<any>(`${this.apiUrl}/register`, payload);
  }

  me() {
    return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true });
  }
}
