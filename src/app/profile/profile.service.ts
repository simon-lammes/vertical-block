import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, switchMap, take} from 'rxjs/operators';
import {Profile} from './profile.model';
import {AuthenticationService} from '../authentication/authentication.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private db: AngularFirestore,
    private authenticationService: AuthenticationService
  ) {
  }

  getAllProfiles$() {
    return this.db.collection<Profile>('profiles').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const profile = a.payload.doc.data() as Profile;
        profile.uid = a.payload.doc.id;
        return profile;
      })),
    );
  }

  getProfileOfCurrentUser$(): Observable<Profile> {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      switchMap(userId => {
        return this.db.collection('profiles').doc<Profile>(userId).valueChanges();
      })
    );
  }

  getProfileOfCurrentUserSnapshot(): Promise<Profile> {
    return this.getProfileOfCurrentUser$().pipe(take(1)).toPromise();
  }

  updateProfileOfCurrentUser$(updatedProfile: Profile) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      switchMap(userId => {
        return this.db.collection('profiles').doc<Profile>(userId).set(updatedProfile);
      })
    ).toPromise();
  }
}
