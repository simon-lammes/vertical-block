import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, mergeMap, reduce, switchMap, take} from 'rxjs/operators';
import {Profile} from './profile.model';
import {AuthenticationService} from '../authentication/authentication.service';
import {from, Observable, of} from 'rxjs';
import {Board} from '../boards/board.model';

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
      }))
    );
  }

  getProfilesByEmailQuery$(emailQuery: string) {
    return this.db.collection<Profile>('profiles', ref => ref
      // https://stackoverflow.com/a/56815787/12244272
        .where('email', '>=', emailQuery)
        .where('email', '<=', emailQuery + '\uf8ff')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const profile = a.payload.doc.data() as Profile;
        profile.uid = a.payload.doc.id;
        return profile;
      }))
    );
  }

  getProfileOfCurrentUser$(): Observable<Profile> {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      switchMap(userId => {
        if (!userId) {
          return of(undefined);
        }
        return this.getProfileById$(userId);
      })
    );
  }

  /**
   * This method returns the profileURL which the user can change in his profile settings.
   */
  getPhotoUrlOfCurrentUserProfile$() {
    return this.getProfileOfCurrentUser$().pipe(
      map(profile => {
        if (!profile) {
          return '';
        }
        return profile.photoURL;
      })
    );
  }

  getProfileOfCurrentUserSnapshot(): Promise<Profile> {
    return this.getProfileOfCurrentUser$().pipe(take(1)).toPromise();
  }

  updateProfileOfCurrentUser$(profileUpdates: Partial<Profile>) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      switchMap(userId => {
        return this.db.collection('profiles').doc<Profile>(userId).update(profileUpdates);
      })
    ).toPromise();
  }

  getProfileById$(userId: string) {
    return this.db.collection('profiles').doc<Profile>(userId).snapshotChanges().pipe(
      map(a => {
        const profile = a.payload.data() as Profile;
        profile.uid = a.payload.ref.id;
        return profile;
      })
    );
  }

  getProfileByIdSnapshot(userId: string): Promise<Profile> {
    return this.getProfileById$(userId).pipe(take(1)).toPromise();
  }

  getAllMembersOfBoard$(board: Board): Observable<Profile[]> {
    if (!board.members) {
      return of([]);
    }
    const memberIds = Object.keys(board.members);
    return from(memberIds).pipe(
      mergeMap(memberId => this.getProfileByIdSnapshot(memberId)),
      // We put the members into arrays so that we can concat those arrays
      // into one big array containing all members.
      map(member => [member]),
      reduce((members, memberToAdd) => members.concat(memberToAdd))
    );
  }
}
