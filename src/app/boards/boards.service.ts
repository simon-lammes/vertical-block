import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Board} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {take, tap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(
    private db: AngularFirestore,
    private authenticationService: AuthenticationService
  ) {
    this.getAllBoardsToWhichTheUserHasAccess$().subscribe(console.log);
  }

  getAllBoardsToWhichTheUserHasAccess$() {
    return this.db.collection<Board>('boards', ref => {
      ref.where('memberIds', 'array-contains', 'h8i03QNFcVNG0c18LDKVmhI30Q32');
      return ref;
    }).valueChanges();
  }

  get allBoardsToWhichTheUserHasAccess$(): Observable<Board[]> {
    const boards: Board[] = [
      {
        title: 'School',
        description: 'Everything I need to do for school.'
      },
      {
        title: 'Home',
        description: 'Managing tasks of our family.'
      },
      {
        title: 'Netflix',
        description: 'Everything I need to watch'
      }
    ];
    return of(boards);
  }

  createNewBoard(board: Board) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          return;
        }
        this.db.collection('boards').add(board);
      })
    );
  }
}
