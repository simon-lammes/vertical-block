import {Injectable} from '@angular/core';
import {Board, BoardBlueprint} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';
import {Observable, of} from 'rxjs';
import {Task, TaskStatus} from './task.model';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor(
    private db: AngularFirestore,
    private authenticationService: AuthenticationService
  ) {
  }

  getAllBoardsToWhichTheUserHasAccess$(): Observable<Board[]> {
    return this.authenticationService.getIdOfCurrentUser$().pipe(
      switchMap(userId => {
        if (!userId) {
          return of([]);
        }
        return this.db.collection('boards', ref => ref
          .where(`members.${userId}`, '>', '')
        ).snapshotChanges()
          .pipe(
            map(actions => actions.map(a => {
              const board = new Board().deserialize(a.payload.doc.data());
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
        const board: Partial<Board> = {
          ...boardBlueprint,
          members: {
            [userId]: 'owner'
          }
        };
        this.db.collection('boards').add(board);
      })
    );
  }

  removeBoard(board: Board) {
    this.db.collection('boards').doc(board.id).delete();
  }

  saveTaskForBoard(board: Board, task: Partial<Task>) {
    return this.db.collection(`boards/${board.id}/tasks`).add(task);
  }

  getBoardById$(boardId: string): Observable<Board> {
    if (!boardId) {
      return of(undefined);
    }
    return this.db.collection('boards').doc(boardId).snapshotChanges().pipe(
      map(snapshot => {
        const board = new Board().deserialize(snapshot.payload.data());
        board.id = snapshot.payload.id;
        return board;
      }),
      shareReplay(1)
    );
  }

  getTasksFromBoardByStatus$(board: Board, taskStatus: TaskStatus) {
    return this.db.collection(`boards/${board.id}/tasks`, ref => ref
      .where('status', '==', taskStatus)
      .orderBy('name'))
      .snapshotChanges()
      .pipe(
        map(snapshots => snapshots.map(snapshot => {
          const task = new Task().deserialize(snapshot.payload.doc.data());
          task.id = snapshot.payload.doc.id;
          return task;
        }))
      );
  }

  deleteTaskFromBoard(task: Task, board: Board) {
    return this.db.doc(`boards/${board.id}/tasks/${task.id}`).delete();
  }

  updateTaskFromBoard(updatedTask: Task, board: Board) {
    return this.db.doc(`boards/${board.id}/tasks/${updatedTask.id}`).set(updatedTask.serialize());
  }

  updateBoard(editedBoard: Board) {
    return this.db.doc(`boards/${editedBoard.id}`).set(editedBoard.serialize());
  }
}
