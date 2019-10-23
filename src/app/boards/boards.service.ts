import {Injectable} from '@angular/core';
import {Board, BoardBlueprint, BoardMemberRole, Task, TaskStatus} from './board.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';
import {Observable} from 'rxjs';
import {Profile} from '../profile/profile.model';

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
          .where(`members.${userId}`, '>', '')
        ).snapshotChanges()
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

  saveTaskForBoard(board: Board, task: Task) {
    return this.db.collection(`boards/${board.id}/tasks`).add(task);
  }

  getBoardById$(boardId: string): Observable<Board> {
    return this.db.collection('boards').doc<Board>(boardId).snapshotChanges().pipe(
      map(snapshot => {
        const board = snapshot.payload.data() as Board;
        board.id = snapshot.payload.id;
        return board;
      }),
      shareReplay(1)
    );
  }

  /**
   * With this method, you can add new members to a board or change a members role.
   * @param member either a new member or an existing member whose role needs to be changed
   * @param board the board which member settings are changed
   * @param role the new role of the member
   */
  saveMemberForBoard(member: Profile, board: Board, role: BoardMemberRole): Promise<any> {
    board.members[member.uid] = role;
    return this.updateBoard(board);
  }

  getTasksFromBoardByStatus$(board: Board, taskStatus: TaskStatus) {
    return this.db.collection<Task>(`boards/${board.id}/tasks`, ref => ref
      .where('status', '==', taskStatus)
      .orderBy('name'))
      .snapshotChanges()
      .pipe(
        map(snapshots => snapshots.map(snapshot => {
          const task = snapshot.payload.doc.data() as Task;
          task.id = snapshot.payload.doc.id;
          return task;
        }))
      );
  }

  deleteTaskFromBoard(task: Task, board: Board) {
    return this.db.doc(`boards/${board.id}/tasks/${task.id}`).delete();
  }

  updateTaskFromBoard(updatedTask: Task, board: Board) {
    return this.db.doc(`boards/${board.id}/tasks/${updatedTask.id}`).set(updatedTask);
  }

  updateBoard(newBoard: Board) {
    return this.db.doc(`boards/${newBoard.id}`).set(newBoard);
  }

  removeMemberFromBoard(member: Profile, board: Board): Promise<any> {
    delete board.members[member.uid];
    return this.updateBoard(board);
  }
}
