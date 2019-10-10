import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {Profile} from './profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private db: AngularFirestore,
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
}
