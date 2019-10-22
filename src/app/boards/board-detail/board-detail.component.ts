import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BoardsService} from '../boards.service';
import {Board, Task, TaskStatus} from '../board.model';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap, take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material';
import {DialogService} from '../../shared/dialog/dialog.service';
import {BoardMemberSettingsComponent} from './board-member-settings/board-member-settings.component';

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
    this.board$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get('boardId')),
      switchMap(boardId => this.boardService.getBoardById$(boardId))
    );
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
    const task: Task = {
      name: taskInputForm.value.taskInput,
      status: 'todo',
      id: ''
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
    this.dialog.open(BoardMemberSettingsComponent, {
      ...this.dialogService.getDefaultDialogConfiguration(),
      data: {boardId}
    });
  }
}
