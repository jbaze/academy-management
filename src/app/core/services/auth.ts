import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { FakeApi } from '../api/fake-api';
import { LoginRequest, RegisterRequest } from '../models/auth';
import { UserRole } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private fakeApiService: FakeApi) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<boolean> {
    return this.fakeApiService.login(credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => true)
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.fakeApiService.register(userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }
}
