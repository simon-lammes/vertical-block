import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private angularFireAuth: AngularFireAuth
  ) {
  }

  getImageUrlOfCurrentUser$() {
    return this.angularFireAuth.authState.pipe(
      map(user => user ? user.photoURL : '')
    );
  }

  logout(): Promise<void> {
    return this.angularFireAuth.auth.signOut();
  }
}
