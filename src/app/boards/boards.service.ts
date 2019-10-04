import {Injectable} from '@angular/core';
import {Board, BoardBlueprint} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, take, tap} from 'rxjs/operators';
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
    return this.db.collection<Board>('boards', ref => {
      return ref.where('memberIds', 'array-contains', 'h8i03QNFcVNG0c18LDKVmhI30Q32');
    }).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const board = a.payload.doc.data() as Board;
        board.id = a.payload.doc.id;
        return board;
      }))
    );
  }

  createNewBoard(boardBlueprint: BoardBlueprint) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          return;
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
}
