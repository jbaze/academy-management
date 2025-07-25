import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FakeApi } from '../api/fake-api';
import { User } from '../models/user';
import { UserRole } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private fakeApiService = inject(FakeApi);

  getUsers(): Observable<User[]> {
    return this.fakeApiService.getUsers();
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.fakeApiService.getUserById(id);
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    // This would be implemented in the fake API service
    throw new Error('Method not implemented in fake API service yet');
  }

  deleteUser(id: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Method not implemented in fake API service yet');
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return new Observable(observer => {
      this.getUsers().subscribe(users => {
        observer.next(users.filter(user => user.role === role));
        observer.complete();
      });
    });
  }
}
