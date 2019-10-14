import {Injectable} from '@angular/core';
import {Board, BoardBlueprint, Task} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';
import {removeValueFromArray} from '../shared/universal-helper.functions';
import {Observable} from "rxjs";

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

  getAllBoardsToWhichTheUserHasBeenInvited$() {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      switchMap(userId => {
        return this.db.collection<Board>('boards', ref => ref
          .where('idsOfInvitedUsers', 'array-contains', userId)
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

  hasUserBeenInvitedToBoards$() {
    return this.getAllBoardsToWhichTheUserHasBeenInvited$().pipe(
      map(boardsToWhichTheUserHasBeenInvited => boardsToWhichTheUserHasBeenInvited.length > 0)
    );
  }

  createNewBoard(boardBlueprint: BoardBlueprint) {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          throw new Error('User should be authenticated to create boards.');
        }
        const board: Partial<Board> = {
          ...boardBlueprint,
          creatorId: userId,
          memberIds: [userId],
          idsOfInvitedUsers: []
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

  acceptInvitationToBoard(board: Board) {
    this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          throw new Error('User should be authenticated to accept invitations.');
        }
        if (!board.idsOfInvitedUsers.includes(userId)) {
          throw new Error('User cannot accept invitation when no invitation exists.');
        }
        removeValueFromArray(board.idsOfInvitedUsers, userId);
        board.memberIds.push(userId);
        return this.updateBoard(board);
      })
    ).toPromise();
  }

  declineInvitationToBoard(board: Board) {
    this.authenticationService.getIdOfCurrentUser$().pipe(
      take(1),
      tap(userId => {
        if (!userId) {
          throw new Error('User should be authenticated to accept invitations.');
        }
        if (!board.idsOfInvitedUsers.includes(userId)) {
          throw new Error('User cannot decline invitation when no invitation exists.');
        }
        removeValueFromArray(board.idsOfInvitedUsers, userId);
        return this.updateBoard(board);
      })
    ).toPromise();
  }

  saveTaskForBoard(board: Board, task: Task) {
    return this.db.collection(`boards/${board.id}/tasks`).add(task);
  }

  getBoardById$(boardId: string): Observable<Board> {
    return this.db.collection('boards').doc<Board>(boardId).snapshotChanges().pipe(
      map(snapshot => {
        const board = snapshot.payload.data() as Board;
        board.id = snapshot.payload.id;
        return board;
      })
    );
  }
}
