import {Injectable} from '@angular/core';
import {Board, BoardBlueprint} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(
    private db: AngularFirestore,
    private authenticationService: AuthenticationService
  ) {
  }

  getAllBoardsToWhichTheUserHasAccess$() {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      switchMap(userId => {
        return this.db.collection<Board>('boards', ref => ref
          .where('memberIds', 'array-contains', userId)
          .orderBy('title'))
          .snapshotChanges()
          .pipe(
            map(actions => actions.map(a => {
              const board = a.payload.doc.data() as Board;
              board.id = a.payload.doc.id;
              return board;
            }))
          );
      })
    );
  }

  createNewBoard(boardBlueprint: BoardBlueprint) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          throw new Error('User should be authenticated to create boards.');
        }
        const board = {
          ...boardBlueprint,
          id: userId,
          memberIds: [userId]
        };
        this.db.collection('boards').add(board);
      })
    );
  }

  removeBoard(board: Board) {
    this.db.collection('boards').doc(board.id).delete();
  }

  updateBoard(newBoard: Board) {
    this.db.doc(`boards/${newBoard.id}`).set(newBoard);
  }
}
