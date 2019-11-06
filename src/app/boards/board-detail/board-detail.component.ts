import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BoardsService} from '../boards.service';
import {Board} from '../board.model';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap, take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material';
import {DialogService} from '../../shared/dialog/dialog.service';
import {BoardMemberSettingsDialogComponent} from './board-member-settings-dialog/board-member-settings-dialog.component';
import {TaskDetailDialogComponent} from './task-detail-dialog/task-detail-dialog.component';
import {Task, TaskStatus} from '../task.model';
import {BoardStatisticsDialogComponent} from './board-statistics-dialog/board-statistics-dialog.component';
import {SaveBoardDialogComponent} from '../save-board-dialog/save-board-dialog.component';

@Component({
  selector: 'app-board-tasks',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss']
})
export class BoardDetailComponent implements OnInit {
  taskInputForm: FormGroup;
  board$: Observable<Board>;
  private todos$: Observable<Task[]>;
  private progress$: Observable<Task[]>;
  private done$: Observable<Task[]>;
  private review$: Observable<Task[]>;

  get boardSnapshot(): Promise<Board> {
    return this.board$.pipe(take(1)).toPromise();
  }

  constructor(
    private boardService: BoardsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.taskInputForm = new FormGroup({
      taskInput: new FormControl('')
    });
    //Data is provided by the resolver in BoardGuard
    this.board$ = this.activatedRoute.data.pipe(map(data => data.board));
    this.todos$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'todo');
      })
    );
    this.progress$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'progress');
      })
    );
    this.done$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'done');
      })
    );
    this.review$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'review');
      })
    );
  }

  onSubmit(taskInputForm: FormGroup) {
    const task: Partial<Task> = {
      name: taskInputForm.value.taskInput,
      status: 'todo',
      id: '',
      description: ''
    };
    this.board$.pipe(take(1)).subscribe(board => {
      this.boardService.saveTaskForBoard(board, task).then(() => {
        this.taskInputForm.reset();
      });
    });
  }

  deleteTask(task: Task) {
    this.board$.pipe(take(1)).subscribe(board => {
      this.boardService.deleteTaskFromBoard(task, board);
    });
  }

  setTasksStatus(task: Task, newStatus: TaskStatus) {
    this.board$.pipe(take(1)).subscribe(board => {
      task.status = newStatus;
      this.boardService.updateTaskFromBoard(task, board);
    });
  }

  async openMemberSettingsDialog() {
    const boardId = await this.board$.pipe(
      take(1),
      map(board => board.id)
    ).toPromise();
    this.dialog.open(BoardMemberSettingsDialogComponent, {
      ...this.dialogService.getDefaultDialogConfiguration(),
      data: {boardId}
    });
  }

  async showTaskDetailDialog(task: Task) {
    const board = await this.board$.pipe(take(1)).toPromise();
    this.dialog.open(TaskDetailDialogComponent, {
      ...this.dialogService.getDefaultDialogConfiguration(),
      data: {
        taskId: task.id,
        board
      }
    });
  }

  async openSaveBoardDialog() {
    const board = await this.boardSnapshot;
    this.dialog.open(SaveBoardDialogComponent, {
      ...this.dialogService.getDefaultDialogConfiguration(),
      data: {
        boardId: board.id
      }
    });
  }

  openStatisticsDialog() {
    this.dialog.open(BoardStatisticsDialogComponent, {height: '90%', width: '90%'});
  }
}
