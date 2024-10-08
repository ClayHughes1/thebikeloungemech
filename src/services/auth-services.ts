import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); // initial value is false
  isLoggedIn = this.loggedIn.asObservable();

  login() {
    this.loggedIn.next(true);
  }

  logout() {
    this.loggedIn.next(false);
  }

  checkLoginStatus(): boolean {
    return this.loggedIn.getValue();
  }
}
